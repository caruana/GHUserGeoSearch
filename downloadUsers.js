// Require
var fs = require('fs'),
    path = require('path'),
    github = require('octonode'),
    sleep = require('sleep'),
    async = require('async'),
    _ = require('lodash');

// change these values
const location = 'prague', // change this value to whatever search location you want
    client = github.client('51a67aad875448498011ecd6c23aba68348befe2'); //insert GitHub personal token here

// constants
const userSearchDir = 'UserSearch',
    userInfoDir = 'UserInfo',
    userSearchFileName = 'userSearch',
    userInfoFileName = 'userInfo',
    concatUserSearchDataFileName = 'concatUserSearch',
    concatUserInfoDataFileName = 'concatUserInfo',
    param = 'location:' + location + '+in:login+type:user',
    order = 'asc',
    sort = 'created';

// initialize
var ghsearch = client.search(),
    resultData = [],
    currentSearchQuery = '';

// search paging initialize
var resultCount = 0,
    perPage = 100,
    remainder = (resultCount % perPage) > 0 ? 1 : 0,
    totalPages = Math.floor(resultCount / perPage) + remainder,
    currentPage = 1,
    maxPage = 10;

init();

// *** Initialize Tasks *** //;
function init() {

    const searchArray = buildSearchQuery();

    console.log('**************************************');
    console.log('Executing ' + searchArray.length + ' API Calls.');
    console.log('Will need to limit to 30 calls a minute.');
    console.log('Run time will be ~' + searchArray.length / 30 + ' minutes.');
    console.log('Current Time: ' + Date.now());
    console.log('**************************************');

    buildSearchQueue(searchArray)
}

function initUserSearchFilesMerge(callbackInitUserInfo) {
    console.log('**************************************');
    console.log('Start merging search data files');
    console.log('Current Time: ' + Date.now());
    console.log('**************************************');


    fs.readdir(nameDir(userSearchDir), function (err, items) {
        if (err) throw err;
        var allJSON = [];
        for (var i = 0; i < items.length; i++) {
            var contents = fs.readFileSync(path.join(nameDir(userSearchDir), items[i]));
            var jsonContent = JSON.parse(contents);
            allJSON = allJSON.concat(jsonContent);
        }
        var mergedFileName = nameFile(concatUserSearchDataFileName);
        fs.writeFile(mergedFileName, JSON.stringify(allJSON, null, 2), 'utf-8', function (err) {
            if (err) {
                throw err;
            }
            callbackInitUserInfo(mergedFileName);
        });
    });
}

function initUserInfo(fileName) {

    fs.readFile(fileName, {encoding: 'utf-8'}, function (err, data) {
        if (err) {
            throw err;
        }

        var searchArray = JSON.parse(data);

        if (searchArray.length > 0) {

            console.log('**************************************');
            console.log('Looking up GitHub User Info');
            console.log('Executing ' + searchArray.length + ' API Calls.');
            console.log('Will need to limit to 30 calls a minute.');
            console.log('Run time will be ~' + searchArray.length / 30 + ' minutes.');
            console.log('Current Time: ' + Date.now());
            console.log('**************************************');

            buildUserInfoQueue(searchArray);

        } else {
            console.log('**************************************');
            console.log('No GitHub User Info To Look Up');
            console.log('Finished.');
            console.log('**************************************');
        }

    });
}

function initUserInfoFilesMerge() {
    console.log('**************************************');
    console.log('Start merging User Info data files');
    console.log('Current Time: ' + Date.now());
    console.log('**************************************');
    fs.readdir(nameDir(userInfoDir), function (err, items) {
        if (err) throw err;
        var allJSON = [];
        for (var i = 0; i < items.length; i++) {
            var contents = fs.readFileSync(path.join(nameDir(userInfoDir), items[i]));
            var jsonContent = JSON.parse(contents);
            allJSON = allJSON.concat(jsonContent);
        }
        var mergedFileName = nameFile(concatUserInfoDataFileName);
        fs.writeFile(mergedFileName, JSON.stringify(allJSON, null, 2), 'utf-8', function (err) {
            if (err) {
                throw err;
            }
        });
    });
}

// *** End Initialize Tasks *** //

// *** Search GitHub *** //
function buildSearchQueue() {
    var q = async.queue(function (query, cb) {
        sleep.sleep(2); // must limit github api calls to 30/minute
        currentSearchQuery = query + '+' + param;
        console.log('Running Query: ' + query);
        ghsearch.users({
            q: currentSearchQuery,
            page: currentPage,
            per_page: perPage,
            sort: sort,
            order: order
        }, function (err, data, header) {
            searchCallBack(err, data, header, cb);
        });
    });
    q.drain = function () {
        initUserSearchFilesMerge(initUserInfo);
    };
    q.push(buildSearchQuery(), function (err) {
        if (err) {
            throw err;
        }
        console.log('Search Query Pushed to Search Queue');
    });
}

function buildSearchQuery() {
    var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', '0', '9', '8', '7', '6', '5', '4', '3', '2', '1', '-', '_', '.'];
    var searchArray = [];
    _.forEach(alphabet, function (val) {
        var first = val;
        _.forEach(alphabet, function (val) {
            searchArray.push(first + val);
        });
    });
    return searchArray;
}

function continueSearchQueueIteration(cb) {
    ghsearch.users({
        q: currentSearchQuery,
        type: 'user',
        page: currentPage,
        per_page: perPage,
        sort: sort,
        order: order
    }, function (err, data, header) {
        searchCallBack(err, data, header, cb);
    });
}

function searchCallBack(err, data, headers, cb) {
    if (!_.isNil(err)) {
        throw err;
    }


    resultCount = data.total_count;
    remainder = (resultCount % perPage) > 0 ? 1 : 0;
    totalPages = Math.floor(resultCount / perPage) + remainder;

    console.log('- Current Page: ' + currentPage + ', Total Count: ' + data.total_count + ', Item Count: ' + data.items.length + ', Total Pages: ' + Math.floor(resultCount / perPage) + remainder);

    if (totalPages > currentPage && maxPage > currentPage) {
        currentPage = currentPage + 1;
        resultData = resultData.concat(data.items);
        continueSearchQueueIteration(cb);
    } else {
        if (data.items.length > 0) {
            if (totalPages === 1 === currentPage || totalPages === currentPage) {
                resultData = resultData.concat(data.items);
            }
            console.log('-- Saved Items: ' + resultData.length);
            fs.writeFile(nameFile(userSearchFileName, userSearchDir), JSON.stringify(resultData, null, 2), 'utf-8', function (err) {
                if (err) {
                    console.log(err);
                }
            });
            resultData = [];
        }
        currentPage = 1;
        resultCount = 0;
        cb();
    }

}

// *** End Search GitHub *** //

// *** Get GitHub User Info *** //
function buildUserInfoQueue(searchArray) {

    var cnt = 0;//resultData.length;
    var q = async.queue(function (task, cb) {
        sleep.sleep(2);
        var uname = task.login;
        var ghu = client.user(uname);
        ghu.info(function (err, data, headers) {
            if (err) {
                console.log(err);
            }

            cnt++;
            console.log(cnt + ': ' + data.login);

            fs.writeFile(nameFile(userInfoFileName, userInfoDir), JSON.stringify(data, null, 2), 'utf-8', function (err) {
                if (err) {
                    console.log(err);
                }
            });

            cb();
        });
    }, 1);
    q.drain = function () {
        initUserInfoFilesMerge();
    };
    q.push(searchArray, function (err) {
        if (err) {
            throw err;
        }
        console.log("GitHub user info pushed to queue.")
    })
}

// *** End Get GitHub User Info *** //

// *** Helper Methods **//
function nameDir(dir) {
    const dataDir = 'Data';
    return path.join(__dirname, dataDir, dir);
}

function nameFile(name, dir, ext) {
    ext = _.isNil(ext) ? '.json' : '.' + ext;
    dir = _.isNil(dir) ? '' : dir;
    name = name + (new Date).getTime();
    return path.format({
        dir: nameDir(dir),
        name: name,
        ext: ext
    });
}

// *** End Helper Methods *** //