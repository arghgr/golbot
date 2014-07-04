var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");

var tweeter = require("./tweeter");

// SCORE FETCHER
// Fetches latest events and checks whether a gol has been scored
// If gol has been scored, runs tweeter

var matches = [];

function Match(matchData) {
  this.match_number = matchData.match_number;
  this.lastMatchData = null;
  this.currentMatchData = matchData;
  this.lastGolEvent_home = null;
  this.lastGolEvent_away = null;
}

var scrapeCurrent = function(file, callback) {
  var matchesData = null;
  if (file) {
    // read in test file:
    fs.readFile(file, { encoding: "utf-8" }, function(error, data) {
      if(!error){
        var $ = cheerio.load(data);
        matchesData = JSON.parse(data);
        parseMatches(matchesData);
      } else {
        console.log(error);
      }
    });
  } else {
    request({
      url: "http://worldcup.sfg.io/matches/today",
      headers: {
        "User-Agent": "worldcupgolbot by @arghgr"
      }
    }, function(error, response, data){
      if(!error){
        var $ = cheerio.load(data);
        matchesData = JSON.parse(data);
        parseMatches(matchesData);
      } else {
        console.log(error);
      }
    });
  }

  var parseMatches = function(matchesData) {
    if (matchesData.length > 0) {
      matchesData.forEach(function(matchData) {
        var matchExists = null;
        for (i = 0; i < matches.length; i++) {
          if (matchData.match_number == matches[i].match_number) {
            matchExists = i;
            console.log("\nfound match_number " + matchData.match_number + " in matches[" + matchExists + "]");
            break;
          }
        }
        if (matchExists == null) {
          console.log("\nadded match #" + matchData.match_number + " to matches");
          var match = new Match(matchData);
          matches.push(match);
          parseData(match);
        } else {
          console.log("updating matches[" + matchExists + "], which is match #" + matchData.match_number);
          var match = matches[matchExists];
          match.lastMatchData = match.currentMatchData;
          match.currentMatchData = matchData;
          parseData(match);
        }
      });
    } else {
      console.log("no matches in progress");
    }
    if (callback) { callback(); }
  };

  var parseData = function(match) {
    var currentMatchData = match.currentMatchData;
    var lastMatchData = match.lastMatchData;

    var home_newEvents = [];
    var away_newEvents = [];
    if (currentMatchData) {
      console.log("***************************");
      console.log(currentMatchData.match_number + " (" + currentMatchData.status + ")" );
      console.log(currentMatchData.home_team.code + " : "
        + currentMatchData.home_team.goals);
      console.log(currentMatchData.away_team.code + " : "
        + currentMatchData.away_team.goals);
      console.log("***************************");
      if (lastMatchData) {
        checkForGol(currentMatchData, lastMatchData);
      } else {
        console.log("no lastMatchData for #" + currentMatchData.match_number);
      }
    }
  };
};

var checkForGol = function(current, last) {
  var home_newEvents = _.filter(current.home_team_events, function(ev) {
    return !_.findWhere(last.home_team_events, ev);
  });
  var away_newEvents = _.filter(current.away_team_events, function(ev) {
    return !_.findWhere(last.away_team_events, ev);
  });

  if (home_newEvents.length > 0) {
    home_newEvents.forEach(function(ev) {
      var gol = ev.type_of_event.indexOf("goal");
      var lastGol = _.where(last.home_team_events, { id: ev.id });
      if (gol > -1 && _.isEmpty(lastGol)) {
        parseGol(ev, current, "home");
      }
    });
  }

  if (away_newEvents.length > 0) {
    away_newEvents.forEach(function(ev) {
      var gol = ev.type_of_event.indexOf("goal");
      var lastGol = _.where(last.away_team_events, { id: ev.id });
      if (gol > -1 && _.isEmpty(lastGol)) {
        parseGol(ev, current, "away");
      }
    });
  }
};

var parseGol = function(ev, match, team) {
  if (team == "home") {
    var team = match.home_team;
    var opponent = match.away_team;
  } else if (team == "away") {
    var team = match.away_team;
    var opponent = match.home_team;
  } else {
    console.log("no team specified in parseGol");
  }
  var type = ev.type_of_event;
  if (type != "goal-own") {
    tweeter.golTweet(team.code, ev);
  } else {
    tweeter.ownGolTweet(team.code, opponent.code, ev);
  }
};

var testFile_x = path.join(__dirname + '/test_files/example8_today4.json');
var testFile_y = path.join(__dirname + '/test_files/example8_today5x.json');
var testFile_z = path.join(__dirname + '/test_files/example8_today5.json');
var runTestFiles = function() {
  scrapeCurrent(testFile_x, function() {
    scrapeCurrent(testFile_y, function() {
      scrapeCurrent(testFile_z);
    });
  });
};

var testFile_a = path.join(__dirname + '/test_files/examplex_currentx.json');
var testFile_b = path.join(__dirname + '/test_files/examplex_currenty.json');
var testFile_c = path.join(__dirname + '/test_files/examplex_currentz.json');
var runCustomTestFiles = function() {
  scrapeCurrent(testFile_a, function() {
    scrapeCurrent(testFile_b, function() {
      scrapeCurrent(testFile_c);
    });
  });
};

var isProduction = JSON.parse(process.env.IS_PRODUCTION);

if (!isProduction) {
  // RUN WITH TEST FILES:
  runTestFiles();
  // runCustomTestFiles();
  // scrapeCurrent(testFile_y);

  // RUN WITH TEST SCRAPER:
  // setInterval(scrapeCurrent, 5000);

  // RUN AT PRODUCTION SCRAPER SPEED:
  // setInterval(scrapeCurrent, 10 * 1000);
}

exports.scrapeCurrent = scrapeCurrent;