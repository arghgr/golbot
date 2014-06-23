var express = require('express');
var fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');

var tweeter = require("./tweeter");

var lastMatchData = null; // Assuming JSON is in an array with one object
var currentMatchData = null; // Assuming JSON is in an array with one object

var lastGolEvent_home = null;
var lastGolEvent_away = null;

var resetValues = function() {
  lastMatchData = null;
  currentMatchData = null;
  lastGolEvent_home = null;
  lastGolEvent_away = null;
  console.log("reset values");
}

var scrapeCurrent = function(file, callback) {
  if (file) {
    // read in test file:
    fs.readFile(file, { encoding: "utf-8" }, function(error, data) {
      if(!error){
        var $ = cheerio.load(data);
        currentMatchData = JSON.parse(data)[0];
        parseData();
      } else {
        console.log(error);
      }
    });
  } else {
    request({
      url: "http://worldcup.sfg.io/matches/current",
      headers: {
        "User-Agent": "worldcupgolbot by @arghgr"
      }
    }, function(error, response, data){
      if(!error){
        console.log(response);
        var $ = cheerio.load(data);
        currentMatchData = JSON.parse(data)[0];
        parseData();
      } else {
        console.log(error);
      }
    });
  }

  var parseData = function() {
    var gol_check = true;
    if (currentMatchData) {
      console.log("\n\n***************************");
      console.log(currentMatchData.match_number + " (" + currentMatchData.status + ")" );
      console.log(currentMatchData.home_team.code + " : "
        + currentMatchData.home_team.goals);
      console.log(currentMatchData.away_team.code + " : "
        + currentMatchData.away_team.goals);
      console.log("***************************");
      if (lastMatchData) {
        if (currentMatchData.match_number == lastMatchData.match_number) {
          gol_check = checkIfNewGol();
        } else {
          console.log("current match_number != last match_number");
        }
      }
      if (gol_check) {
        lastMatchData = currentMatchData;
      } else {
        console.log("scrape: gol_check senses something fishy");
      }
      if (callback) { callback(); }
      return currentMatchData;
    } else {
      console.log("no matches in progress");
      resetValues();
    }
    return;
  };
};

var searchGolEvent = function(match, team) {
  console.log("######## SEARCHING FOR GOL EVENT ########");
  var events = null;
  var lastEvent = null;
  if (team == "home") {
    events = match.home_team_events.reverse();
    console.log("searching home events!");
  } else if (team == "away") {
    events = match.away_team_events.reverse();
    console.log("searching away events!");
  } else {
    console.log("wtf was there even a gol?");
  }

  if (events) {
    for (i = 0; i < events.length; i++) {
      lastEvent = events[i];
      if (lastEvent.type_of_event != "goal") {
        console.log("event " + i + " not gol");
        continue;
      } else {
        console.log("found gol!");
        break;
      }
    }
  } else {
    console.log("search: no events?");
  }

  if (lastEvent) {
    if (lastEvent.type_of_event == "goal") {
      console.log("########################################");
      return lastEvent;
    } else {
      console.log("gol not found");
      console.log("????????????????????????????????????????");
      return null;
    }
  } else {
    console.log("search: no lastEvent?");
  }
};

var checkIfNewGol = function() {
  console.log("++++++++++++++++++++++++++");
  console.log("GOL CHECK:");

  var home = currentMatchData.home_team;
  var away = currentMatchData.away_team;

  var homeGol = null;
  var awayGol = null;
  var homeGol_event = null;
  var awayGol_event = null;

  var checkEvents = function(team) {
    var last = null;
    var current = null;
    var gol = null;
    var lastGolEvent = null;
    if (team == "home") {
      last = lastMatchData.home_team;
      current = home;
      lastGolEvent = lastGolEvent_home;
    } else if (team == "away") {
      last = lastMatchData.away_team;
      current = away;
      lastGolEvent = lastGolEvent_away;
    } else {
      console.log("no team specified");
    }

    console.log(team + ": " + last.goals + " =?= " + current.goals);

    if (last && current && last.goals < current.goals) {
      gol = true;
      var gol_event = searchGolEvent(currentMatchData, team);
      if (gol_event != null && !_.isEqual(gol_event, lastGolEvent)) {
        if (team == "home") {
          homeGol = gol;
          homeGol_event = gol_event;
          lastGolEvent_home = gol_event;
        } else if (team == "away") {
          awayGol = gol;
          awayGol_event = gol_event;
          lastGolEvent_away = gol_event;
        }
      } else if (_.isEqual(gol_event, lastGolEvent)) {
        console.log("gol_event = lastGolEvent?!");
        console.log(lastGolEvent);
      } else {
        console.log("gol_event is null?");
      }
    }
  };

  checkEvents("home");
  checkEvents("away");

  // Tweet if gol; tweet earlier gol first if both home and away
  if (homeGol && awayGol) {
    if (homeGol_event && awayGol_event) {
      console.log("2 goals at once? comparing times:");
      console.log(homeGol_event.time);
      console.log(awayGol_event.time);
      if (homeGol_event.time > awayGol_event.time) {
        tweeter.golTweet(away.code, awayGol_event);
        tweeter.golTweet(home.code, homeGol_event);
      } else {
        tweeter.golTweet(home.code, homeGol_event);
        tweeter.golTweet(away.code, awayGol_event);
      }
    } else {
      console.log("hah?");
    }
  } else if (homeGol || awayGol) {
    if (homeGol && homeGol_event) { tweeter.golTweet(home.code, homeGol_event); }
    if (awayGol && awayGol_event) { tweeter.golTweet(away.code, awayGol_event); }
  }

  // Checks whether gol is detected and is accompanied by gol event
  // if checkIfGol returns false, lastMatchData won't be replaced w/ currentMatchData
  // (so curentMatchData can run again and properly get gol event when it exists)
  if (homeGol || awayGol) {
    if ((homeGol && homeGol_event) || (awayGol && awayGol_event)) {
      console.log("gol detected");
      console.log("++++++++++++++++++++++++++");
      return true;
    } else {
      console.log("gol doesn't have event");
      console.log("++++++++++++++++++++++++++");
      return false;
    }
  } else {
    console.log("no gol detected");
    console.log("++++++++++++++++++++++++++");
    return true;
  }
};

var runTestFiles = function() {
  var testFile_x = path.join(__dirname + '/test_files/example0_current1.json');
  var testFile_y = path.join(__dirname + '/test_files/example0_current2.json');
  var testFile_z = path.join(__dirname + '/test_files/example0_current3.json');
  scrapeCurrent(testFile_x, function() {
    scrapeCurrent(testFile_y, function() {
      scrapeCurrent(testFile_z, function() {
        console.log("***********aaaaaa what***************");
      });
    });
  });
};

// RUN WITH TEST FILES:
runTestFiles();

// RUN WITH TEST SCRAPER:
// setInterval(scrapeCurrent, 5000);

// RUN AT PRODUCTION SCRAPER SPEED:
// setInterval(scrapeCurrent, 10 * 1000);