var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var _ = require("underscore");

var scorefetcher = require("./scorefetcher");
var runScraper = require("./utils").runScraper;

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

var getMatches = function(file = null) {
  runScraper({
    file: file,
    url: "http://worldcup.sfg.io/matches/today",
    parseCallback: checkMatchTimes
  });

  var checkMatchTimes = function(matchesData) {
    var datetime = new Date();
    var date = datetime.toJSON().substr(0,10);
    var hour = (parseInt(datetime.toJSON().substr(11,13), 10)) - 3;
    if (hour < 0) { hour += 24; }
    // console.log("current: " + date + " " + hour + "h");
    if (matchesData.length > 0) {
      var doScrape = false;
      for (i = 0; i < matchesData.length; i++) {
        if (matchesData[i].datetime.length == 20 || matchesData[i].datetime.length == 29) {
          var matchDate = matchesData[i].datetime.substr(0,10);
          var matchHour = parseInt(matchesData[i].datetime.substr(11,13), 10);
          console.log("match at: " + matchDate + " " + matchHour + "h");
          var matchEnd = matchHour + 3; // Assumes games are 3 hours max
          if (date == matchDate) {
            if (hour >= matchHour && hour < matchEnd) {
              console.log("GAME TIME");
              doScrape = true;
              break;
            }
          }
        }
      }
      if (doScrape) {
        if (scraper) { clearInterval(scraper); }
        console.log("scraper started");
        startScraper();
        endScraper();
      }
    } else {
      console.log("matchesData is empty");
    }
  };
};

var checkIfMatch = function(file, scrapeStart = 55, scrapeEnd = 10) {
  var datetime = new Date();
  var minutes = datetime.getMinutes();
  var date = datetime.toJSON().substr(0,10);
  var hour = (parseInt(datetime.toJSON().substr(11,13), 10)) - 3;
  if (hour < 0) { hour += 24; }
  // Checks for matches in the last five minutes and first ten minutes of every hour
  // console.log("now: " + date + " " + hour + "h " + minutes + "m");
  if ((minutes >= scrapeStart || minutes <= scrapeEnd) && (!scraper)) {
    getMatches(file);
  }
};

var testFile1 = path.join(__dirname + '/test_files/examplex_currentx.json');
var testFile2 = path.join(__dirname + '/test_files/examplex_currenty.json');

var isProduction = process.env.IS_PRODUCTION ? JSON.parse(process.env.IS_PRODUCTION) : false;

if (isProduction == true) {
  // RUN WITH PRODUCTION DATA AND SCRAPE SPEEDS
  var scoreCheck_freq = 1000 * 20; // Scrape every twenty seconds
  var match_length = 1000 * 60 * 60 * 3; // Keep scraper running for 3 hours
  var ping_interval = 1000 * 60; // Check time every minute

  console.log("isProduction? " + isProduction);
  console.log("scoreCheck_freq? " + scoreCheck_freq);
  console.log("match_length? " + match_length);
  console.log("ping_interval? " + ping_interval);
  var production = setInterval(function() {
    checkIfMatch();
  }, ping_interval);
} else if (isProduction == false) {
  // RUN WITH TEST DATA AND SCRAPE SPEEDS
  var scoreCheck_freq = 1000 * 5;
  var match_length = 1000 * 30;
  var ping_interval = 1000 * 10;

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
