var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var _ = require("underscore");

var scorefetcher = require("./scorefetcher");
var runScraper = require("./utils").runScraper;

var isProduction = process.env.IS_PRODUCTION ? JSON.parse(process.env.IS_PRODUCTION) : false;

// MATCH CHECKER
// Every hour, checks whether a match is in progress
// If match is in progress, runs score fetcher every 10 seconds for 2.5 hours

var scraper = null;

var startScraper = function() {
  console.log("*********** SCRAPING ***********");
  scraper = setInterval(function() {
    scorefetcher.scrapeCurrent();
  }, scoreCheck_freq);
};

var endScraper = function() {
  setTimeout(function() {
    clearInterval(scraper);
    scraper = null;
    console.log("********************************");
  }, match_length);
};

var parseDate = function(dt) {
  var minutes = dt.getUTCMinutes().toString().padStart(2,"0");
  var seconds = dt.getUTCSeconds().toString().padStart(2,"0");
  var date = [
    dt.getUTCFullYear(),
    (dt.getUTCMonth() + 1).toString().padStart(2,"0"), // zero-indeeeeeeeexed
    dt.getUTCDate().toString().padStart(2,"0")
  ].join("-");
  var hour = dt.getUTCHours();
  var dateString = date + " " + hour + "h " + minutes + "m " + seconds + "s";
  return {
    minutes: minutes,
    seconds: seconds,
    date: date,
    hour: hour,
    dateString: dateString
  }
}

var getMatches = function(file = null) {
  var checkMatchTimes = function(matchesData) {
    var d = parseDate(new Date());
    if (!isProduction) console.log("current: " + d.date + " " + d.hour + "h " + d.minutes + "m");
    if (!matchesData || !_.isArray(matchesData) || !_.isObject(matchesData[0])) {
      console.error("checkMatchTimes: matchesData not an array of objects -", matchesData);
    } else if (matchesData.length > 0) {
      var doScrape = false;
      for (i = 0; i < matchesData.length; i++) {
        if (matchesData[i].datetime.length == 20 || matchesData[i].datetime.length == 29) {
          var matchDate = matchesData[i].datetime.substr(0,10);
          var matchHour = parseInt(matchesData[i].datetime.substr(11,13), 10);
          var matchEnd = matchHour + 3; // Assumes games are 3 hours max
          if (d.date == matchDate) {
            if (d.hour >= matchHour && d.hour < matchEnd) {
              if (!scraper) {
                console.log("\nmatch at: " + matchDate + " " + matchHour + "h");
                console.log("now: " + d.date + " " + d.hour + "h " + d.minutes + "m");
                console.log("GAME TIME");
              }
              doScrape = true;
              break;
            }
          }
        }
      }
      if (doScrape) {
        if (scraper) { clearInterval(scraper); }
        startScraper();
        endScraper();
      }
    }
  };
  runScraper({
    file: file,
    url: "http://worldcup.sfg.io/matches/today",
    parseCallback: checkMatchTimes
  });
};

var checkIfMatch = function(file, scrapeStart = 55, scrapeEnd = 10) {
  var d = parseDate(new Date());
  // Checks for matches in the last five minutes and first ten minutes of every hour
  if (!isProduction) console.log("checkIfMatch now: " + d.dateString);
  if ((d.minutes >= scrapeStart || d.minutes <= scrapeEnd) && (!scraper)) {
    getMatches(file);
  }
};

var testFile1 = path.join(__dirname + '/test_files/examplex_currentx.json');
var testFile2 = path.join(__dirname + '/test_files/examplex_currenty.json');

if (isProduction == true) {
  // RUN WITH PRODUCTION DATA AND SCRAPE SPEEDS
  var scoreCheck_freq = 1000 * 35; // Scrape every 35 seconds
  var match_length = 1000 * 60 * 60 * 3; // Keep scraper running for 3 hours
  var ping_interval = 1000 * 60; // Check time every minute

  console.log("timestamp: " + new Date().toUTCString());
  console.log("isProduction? " + isProduction);
  console.log("scoreCheck_freq? " + scoreCheck_freq);
  console.log("match_length? " + match_length);
  console.log("ping_interval? " + ping_interval);
  var production = setInterval(function() {
    checkIfMatch();
  }, ping_interval);
} else if (isProduction == false) {
  // RUN WITH TEST DATA AND SCRAPE SPEEDS
  var scoreCheck_freq = 1000 * 35;
  var match_length = 1000 * 60 * 10;
  var ping_interval = 1000 * 10;

  console.log("timestamp: " + new Date().toUTCString());
  console.log("isProduction? " + isProduction);
  console.log("scoreCheck_freq? " + scoreCheck_freq);
  console.log("match_length? " + match_length);
  console.log("ping_interval? " + ping_interval);
  // getMatches(testFile1);
  var test = setInterval(function() {
    checkIfMatch(null, scrapeStart = 0, scrapeEnd = 0);
  }, ping_interval);
} else {
  console.log("no isProduction");
}
