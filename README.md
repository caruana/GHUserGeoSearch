# GitHub Geo User Search

### Background
I travel a lot and I like networking with developers in the city I'm visiting to get a sense of the local tech scene. So many people are working on so many cool projects, it's an absolute blast learn about!

I thought I would try to scale my networking by growth hacking a process that streamlined the number of people I could connect with before I got to my destination.

So I decided to write a small script in NodeJS over a weekend and called it **GitHub Geo User Search**. My main concern doing this is what people's reactions will be. I will be documenting this test in a series of blog posts, the first of which can be found [here](http://www.caruana.io/blog/post/github-user-location-search).

### Requirements

* Speed to development
* Small script
* Easy to search multiple cities
* Extract the largest sample size
* Avoid using a database, so store all data in .json files 

##### GitHub API Call Limits

* GitHub limits the number of hourly calls to 30
  * Will need to limit calls to 1 every 2 seconds
* GitHub will limit your accessible search results to 1000 results
  * Needed to devise away around this limitation
  * Build an array of characters that can be used in a login name
  * Create a two character array of every combination of characters 
  * Search GitHub by location and two characters from the array (eg. aa, ab, ac ... za, za, zc ... _a, _b, _c)
  * Execute a search every two seconds until the application has iterated over every possible character pair
  * Store the results of every API call in a .json file
  * Merge all search result .json files into one
* Request user info from all users found in search result  
  * Save user info into a .json file
  * Merge all .json files into one
  * Convert .json file int a .csv file
  
#### Install GitHub Geo User Search

* Clone the repo
* npm install
* Create a Data Directory (yes, I was to lazy to automatically check and make a dir, lol)
* Open the downloadUsers.js file 
  * Change the location variable value; insert the location you would like to search (line 10)
  * Change the client value; insert your GitHub Personal Token (line 11)
* node downloadUsers.js
* Depending on the search results this could take a while

Feel free to get in touch, send a pull request or post any issues.

bc.
