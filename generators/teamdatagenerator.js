var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var _ = require("underscore");

// TEAM DATA GENERATOR
// This generates JSON to use for ocalculator.js.
// 

var roundOf16 = null;
var roundOf16_players = null;

var roundOf16_LatinAmBg = {
  "ALG": 0,
  "ARG": 23,
  "BEL": 0,
  "BRA": 23,
  "CHI": 23,
  "COL": 23,
  "CRC": 23,
  "FRA": 0,
  "GER": 0,
  "GRE": 1,
  "MEX": 23,
  "NED": 0,
  "NGA": 0,
  "SUI": 1,
  "URU": 23,
  "USA": 3,
};

var roundOf16_LatinAmClubs = {
  "ALG":0,
  "ARG":4,
  "BEL":0,
  "BRA":4,
  "CHI":7,
  "COL":6,
  "CRC":7,
  "FRA":0,
  "GER":0,
  "GRE":0,
  "MEX":15,
  "NED":0,
  "NGA":0,
  "SUI":0,
  "URU":5,
  "USA":1
};

var getRoundOf16 = function(file) {
  var fileData = null;
  var roundOf16 = {};
  if (file) {
    fileData = fs.readFileSync(file, { encoding: "utf8" }, function(error, data) {
      if (error) { console.log(error); }
      return data;
    });
  }
  groupResults = JSON.parse(fileData);
  for (var group in groupResults) {
    var team1 = groupResults[group].group.teams[0].team;
    var team2 = groupResults[group].group.teams[1].team;
    roundOf16[team1.fifa_code] = team1.country;
    roundOf16[team2.fifa_code] = team2.country;
  }
  return roundOf16;
};

var getPlayerFiles = function(file) {
  var fileData = null;
  if (file) {
    fileData = fs.readFileSync(file, { encoding: "utf8" }, function(error, data) {
      if (error) { console.log(error); }
      return data;
    });
  }
  var players = JSON.parse(fileData);
  var roundOf16_players = {};
  for (var group in roundOf16) { roundOf16_players[group] = []; }
  for (var player in players) {
    for (var group in roundOf16) {
      if (players[player].nationality == roundOf16[group]) {
        roundOf16_players[group].push(players[player]);
        break;
      } else if (players[player].nationality == "United States") {
        roundOf16_players["USA"].push(players[player]);
        break;
      }
    }
  }
  return roundOf16_players;
};

var getNaturalized = function(players) {
  var naturalized = {};
  for (var group in roundOf16) { naturalized[group] = []; }
  for (var team in players) {
    console.log("\n");
    console.log(team);
    for (var player in players[team]) {
      if (players[team][player].nationality != players[team][player].birthCountry) {
        console.log(players[team][player].firstName + " " + players[team][player].lastName +
        ": " + players[team][player].birthCountry);
        naturalized[team].push(players[team][player]);
      }
    }
  }
  return naturalized;
};

var getLatinAmFiles = function(latinAmBg, latinAmClubs) {
  var finalData = {};

  finalData["background"] = latinAmBg;
  finalData["clubs"] = latinAmClubs;
  console.log(finalData);

  var writePath = path.join(__dirname, "..", "/generated_files/latin_am_data.json");
  fs.writeFileSync(writePath, JSON.stringify(finalData), { encoding: "utf8" },
    function(err) {
    if (err) throw err;
  });
  console.log("Saved file to ../generated_files/latin_am_data.json");
};

var players_data = path.join(__dirname, "..", "/data_files/players.json");
var group_data = path.join(__dirname, "..", "/data_files/group_results.json");

roundOf16 = getRoundOf16(group_data);
roundOf16_players = getPlayerFiles(players_data);
getNaturalized(roundOf16_players);
getLatinAmFiles(roundOf16_LatinAmBg, roundOf16_LatinAmClubs);

