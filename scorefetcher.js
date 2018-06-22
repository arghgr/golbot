var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var _ = require("underscore");

var tweeter = require("./tweeter");
var runScraper = require("./utils").runScraper;

// SCORE FETCHER
// Fetches latest events and checks whether a gol has been scored
// If gol has been scored, runs tweeter

var matches = [];

function Match(matchData) {
  this.fifa_id = matchData.fifa_id;
  this.lastMatchData = null;
  this.currentMatchData = matchData;
  this.lastGolEvent_home = null;
  this.lastGolEvent_away = null;
}

var scrapeCurrent = function(file) {
  var parseMatches = function(matchesData) {
    if (!matchesData || !_.isArray(matchesData) || !_.isObject(matchesData[0])) {
      if (!isProduction) console.error("parseMatches: matchesData not an array of objects -", matchesData);
    } else if (matchesData.length > 0) {
      matchesData.forEach(function(matchData) {
        var matchExists = null;
        for (i = 0; i < matches.length; i++) {
          if (matchData.fifa_id == matches[i].fifa_id) {
            matchExists = i;
            if (!isProduction) console.log("\nfound fifa_id " + matchData.fifa_id + " in matches[" + matchExists + "]");
            break;
          }
        }
        if (matchExists == null) {
          console.log("\nadded match #" + matchData.fifa_id + " to matches");
          var match = new Match(matchData);
          matches.push(match);
          parseData(match);
        } else {
          if (!isProduction) console.log("updating matches[" + matchExists + "], which is match #" + matchData.fifa_id);
          var match = matches[matchExists];
          match.lastMatchData = match.currentMatchData;
          match.currentMatchData = matchData;
          parseData(match);
        }
      });
    } else {
      if (!isProduction) console.log("no matches in progress");
    }
  };

  var parseData = function(match) {
    var currentMatchData = match.currentMatchData;
    var lastMatchData = match.lastMatchData;

    var home_newEvents = [];
    var away_newEvents = [];
    if (currentMatchData) {
      if (lastMatchData) {
        if (!_.isEqual(currentMatchData, lastMatchData)) {
          if (!isProduction) {
            console.log("***************************");
            console.log(currentMatchData.fifa_id + " (" + currentMatchData.status + ")" );
            console.log(currentMatchData.home_team.code + " : "
              + currentMatchData.home_team.goals);
            console.log(currentMatchData.away_team.code + " : "
              + currentMatchData.away_team.goals);
            console.log("***************************");
          }
          checkForGol(currentMatchData, lastMatchData);
          checkForShootout(currentMatchData, lastMatchData);
        }
      } else {
        if (!isProduction) console.log("no lastMatchData for #" + currentMatchData.fifa_id);
      }
    }
  };

  runScraper({
    file: file,
    url: "http://worldcup.sfg.io/matches/current",
    parseCallback: parseMatches
  });
};

var checkForShootout = function(current, last) {
  var currentStatus = current.status;
  var lastStatus = last.status;
  var home = current.home_team;
  var away = current.away_team;
  if (currentStatus == "completed" & lastStatus == "in progress") {
    if (home.penalties && away.penalties) {
      if (home.penalties > away.penalties) {
        tweeter.penaltyTweet(home.code, home.penalties);
      } else if (home.penalties < away.penalties) {
        tweeter.penaltyTweet(away.code, away.penalties);
      } else {
        console.log("there was a penalty shootout tie?");
      }
    }
  }
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
    console.error("parseGol error: no team specified");
  }
  var type = ev.type_of_event;
  if (type != "goal-own") {
    tweeter.golTweet(team.code, ev);
  } else {
    tweeter.ownGolTweet(team.code, opponent.code, ev);
  }
};

var testFile_x = path.join(__dirname + '/test_files/example9_today4.json');
var testFile_y = path.join(__dirname + '/test_files/example9_today5.json');
var testFile_z = path.join(__dirname + '/test_files/example9_today5.json');
var runTestFiles = function() {
  scrapeCurrent(testFile_x);
  scrapeCurrent(testFile_y);
  scrapeCurrent(testFile_z);
};

var testFile_a = path.join(__dirname + '/test_files/20180622todayCRCvsBRA1.json');
var testFile_b = path.join(__dirname + '/test_files/20180622todayCRCvsBRA2.json');
var testFile_c = path.join(__dirname + '/test_files/20180622todayCRCvsBRA3.json');
var runCustomTestFiles = function() {
  scrapeCurrent(testFile_a);
  scrapeCurrent(testFile_b);
  scrapeCurrent(testFile_c);
};

var isProduction = process.env.IS_PRODUCTION ? JSON.parse(process.env.IS_PRODUCTION) : false;

if (!isProduction) {
  // RUN WITH TEST FILES:
  // runTestFiles();
  // runCustomTestFiles();
  // scrapeCurrent(testFile_c);

  // RUN WITH TEST SCRAPER:
  // setInterval(scrapeCurrent, 5000);

  // RUN AT PRODUCTION SCRAPER SPEED:
  // setInterval(scrapeCurrent, 10 * 1000);
}

exports.scrapeCurrent = scrapeCurrent;
