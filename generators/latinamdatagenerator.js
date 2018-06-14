var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var _ = require("underscore");

// TEAM DATA GENERATOR
// This generates a template file for teams' Latin American data
// that is used in ocalculator.js.

var fifa_data = path.join(__dirname, "..", "/generated_files/fifa_data.json");
var teams_data = null;
var latinAmData = {
  // Number of players in team with recorded Latin American or Hispanic background
  "background": {},
  // Number of players in team who have ever played for Latin American or Hispanic clubs
  "clubs": {}
};
var generateTeamsDataObj = function(fileData) {
  if (fileData) {
    teams_data = fs.readFileSync(fileData, { encoding: "utf-8" }, function(error, data) {
      if (error) { console.log(error); }
      return data;
    });
  };
  var fifaData = JSON.parse(teams_data);
  var fifaCodes = Object.keys(fifaData);
  var sortedFifaCodes = _.sortBy(fifaCodes, function(fifaCode){ return fifaCode; })
  sortedFifaCodes.forEach(function(fifaCode) {
    latinAmData["background"][fifaCode] = 0;
    // Default fill clubs with all 23 players if country is in Latin America:
    latinAmData["clubs"][fifaCode] = (fifaData[fifaCode][4] === true) ? 23 : 0;
  });
  // console.log("sortedFifaCodes: ", sortedFifaCodes)
  // console.log("sortedFifaCodes size: " + _.size(sortedFifaCodes));
  console.log(latinAmData);
};

var generateLatinAmDataFile = function(latinAmData) {
  var writePath = path.join(__dirname, "..", "/generated_files/latin_am_data.json");
  fs.writeFileSync(writePath, JSON.stringify(latinAmData, null, 2), { encoding: "utf8" },
    function(err) {
    if (err) throw err;
  });
  console.log("Saved template file to ../generated_files/latin_am_data.json");
};

generateTeamsDataObj(fifa_data);
generateLatinAmDataFile(latinAmData);
