var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Json2csvParser = require('json2csv').Parser,
    fileName = 'concatUserInfo1531592814850', // change file name
    filePath = lookupFile(fileName, '', 'json'),
    withEmail = [];

const csvFields = ['login', 'name', 'email', 'company', 'blog', 'hireable', 'public_repos', 'public_gists', 'followers', 'following', 'created_at', 'updated_at', 'bio', 'html_url'],
    csvOpts = {fields: csvFields, excelStrings: true};

fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
        var users = JSON.parse(data);
        _.forEach(users, function (user) {
            if (user.email !== null) {
                withEmail.push(user);
            }
        });
        try {
            const parser = new Json2csvParser(csvOpts);
            const csv = parser.parse(withEmail);
            fs.writeFile(nameFile('users'), csv, 'utf-8', function (err) {
            });

            console.log(csv);
        } catch (err) {
            console.error(err);
        }
    } else {
        console.log(err);
    }
});

// *** Helper Methods **//

function nameDir(dir) {
    const dataDir = 'Data';
    return path.join(__dirname, dataDir, dir);
}

function nameFile(name, dir, ext) {
    ext = _.isNil(ext) ? '.csv' : '.' + ext;
    dir = _.isNil(dir) ? '' : dir;
    name = name + (new Date).getTime();
    return path.format({
        dir: nameDir(dir),
        name: name,
        ext: ext
    });
}

function lookupFile(name, dir, ext) {
    ext = _.isNil(ext) ? '.csv' : '.' + ext;
    dir = _.isNil(dir) ? '' : dir;
    return path.format({
        dir: nameDir(dir),
        name: name,
        ext: ext
    });
}

// *** End Helper Methods *** //