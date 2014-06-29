var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");

var tweeter = require("./tweeter");

// SCORE FETCHER
// Fetches score data and checks whether a goal has been scored
// If goal has been scored, runs tweeter

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
      console.log("no matches in progress\nresetting values");
      matches = [];
    }
    if (callback) { callback(); }
  };

  var parseData = function(match) {
    var currentMatchData = match.currentMatchData;
    var lastMatchData = match.lastMatchData;

    var gol_check = true;
    if (currentMatchData) {
      console.log("***************************");
      console.log(currentMatchData.match_number + " (" + currentMatchData.status + ")" );
      console.log(currentMatchData.home_team.code + " : "
        + currentMatchData.home_team.goals);
      console.log(currentMatchData.away_team.code + " : "
        + currentMatchData.away_team.goals);
      console.log("***************************");
      if (lastMatchData) {
        if (currentMatchData.match_number == lastMatchData.match_number) {
          gol_check = checkIfNewGol(match);
        } else {
          console.log("current match_number != last match_number");
        }
      } else {
        console.log("no lastMatchData for #" + currentMatchData.match_number);
      }
      if (gol_check) {
        match.lastMatchData = match.currentMatchData;
      } else {
        console.log("scrape: gol_check senses something fishy. not updating lastMatchData for now");
      }
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
    var eventType = lastEvent.type_of_event;
    var eventString = eventType.substring(0, 4);
    if (eventString) {
      if (eventString == "goal") {
        console.log("########################################");
        return lastEvent;
      } else {
        console.log("gol not found");
        console.log("????????????????????????????????????????");
        return null;
      }
    } else {
      if (eventType == "goal" || eventType == "goal-penalty") {
        console.log("########################################");
        return lastEvent;
      } else {
        console.log("gol not found??");
        console.log("????????????????????????????????????????");
        return null;
      }
    }
  } else {
    console.log("search: no lastEvent?");
  }
};

var checkIfNewGol = function(match) {
  console.log("++++++++++++++++++++++++++");
  console.log("GOL CHECK:");

  var home = match.currentMatchData.home_team;
  var away = match.currentMatchData.away_team;

  var homeGol = null;
  var awayGol = null;
  var homeGol_event = null;
  var awayGol_event = null;
  var homePenalty = null;
  var awayPenalty = null;

  var checkEvents = function(team) {
    var last = null;
    var current = null;
    var gol = null;
    var penalty = null;
    var lastGolEvent = null;
    if (team == "home") {
      last = match.lastMatchData.home_team;
      current = home;
      lastGolEvent = match.lastGolEvent_home;
    } else if (team == "away") {
      last = match.lastMatchData.away_team;
      current = away;
      lastGolEvent = match.lastGolEvent_away;
    } else {
      console.log("no team specified");
    }

    console.log(team + ": " + last.goals + " =?= " + current.goals);

    if (last && current && last.goals < current.goals) {
      gol = true;
      var gol_event = searchGolEvent(match.currentMatchData, team);
      if (gol_event != null && !_.isEqual(gol_event, lastGolEvent)) {
        if (team == "home") {
          homeGol = gol;
          homeGol_event = gol_event;
          match.lastGolEvent_home = gol_event;
        } else if (team == "away") {
          awayGol = gol;
          awayGol_event = gol_event;
          match.lastGolEvent_away = gol_event;
        }
      } else if (gol_event != null && _.isEqual(gol_event, lastGolEvent)) {
        console.log("gol_event = lastGolEvent?!");
        console.log(lastGolEvent);
      } else {
        console.log("gol_event is null?");
      }
    } else if (last && current && last.penalties < current.penalties) {
      penalty = true;
      if (team == "home") {
        homePenalty = penalty;
      } else if (team == "away") {
        awayPenalty = penalty;
      }
    }
  };

  checkEvents("home");
  checkEvents("away");

  // Checks whether gol is detected and is accompanied by gol event
  // Tweet if gol; tweet earlier gol first if both home and away
  // If checkIfGol returns false, lastMatchData won't be replaced w/ currentMatchData
  // (so curentMatchData can run again and properly get gol event when it exists)
  if (homeGol && awayGol) {
    if (homeGol_event && awayGol_event) {
      console.log("both home & away gols? comparing times: home " + homeGol_event.time + " vs away " +
        awayGol_event.time);
      if (homeGol_event.time > awayGol_event.time) {
        tweeter.golTweet(away.code, awayGol_event);
        tweeter.golTweet(home.code, homeGol_event);
      } else {
        tweeter.golTweet(home.code, homeGol_event);
        tweeter.golTweet(away.code, awayGol_event);
      }
      console.log("2 gols detected");
      console.log("++++++++++++++++++++++++++");
      return true;
    } else {
      console.log("2 gols detected, but not both gol events");
      console.log("++++++++++++++++++++++++++");
      return false;
    }
  } else if (homeGol || awayGol) {
    if (homeGol && homeGol_event) {
      tweeter.golTweet(home.code, homeGol_event);
      console.log("home gol detected");
      console.log("++++++++++++++++++++++++++");
      return true;
    } else if (awayGol && awayGol_event) {
      tweeter.golTweet(away.code, awayGol_event);
      console.log("away gol detected");
      console.log("++++++++++++++++++++++++++");
      return true;
    } else {
      console.log("gol doesn't have event");
      console.log("++++++++++++++++++++++++++");
      return false;
    }
  } else if (homePenalty || awayPenalty) {
    if (homePenalty) { tweeter.penaltyTweet(home.code); }
    if (awayPenalty) { tweeter.penaltyTweet(away.code); }
    return true;
  } else {
    console.log("no gol detected");
    console.log("++++++++++++++++++++++++++");
    return true;
  }
};

var testFile_x = path.join(__dirname + '/test_files/example5_current1.json');
var testFile_y = path.join(__dirname + '/test_files/example5_current2.json');
var testFile_z = path.join(__dirname + '/test_files/example5_current3.json');
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
// RUN WITH TEST FILES:
// runTestFiles();
// runCustomTestFiles();
// scrapeCurrent(testFile_y);

// RUN WITH TEST SCRAPER:
// setInterval(scrapeCurrent, 5000);

// RUN AT PRODUCTION SCRAPER SPEED:
// setInterval(scrapeCurrent, 10 * 1000);

exports.scrapeCurrent = scrapeCurrent;