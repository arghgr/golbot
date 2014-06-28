var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var _ = require("underscore");

// COUNTRY DATA GENERATOR
// Run this file to generate a JSON file of data on FIFA countries and their capital cities
// based on their FIFA code.
// I took data from the World Bank API and matched it to FIFA's country codes using
// @MutualArising's World Cup API.
// http://api.worldbank.org/countries?per_page=260&format=json
// http://worldcup.sfg.io/teams

var file1_data = null;
var file2_data = null;
var countries = {};
var teams = {};
var matches = {};
var nonmatches = {};
var finalData = {};

var getMatches = function(file1, file2) {

  if (file1 && file2) {
    file1_data = fs.readFileSync(file1, { encoding: "utf-8" }, function(error, data) {
      if (error) { console.log(error); }
      return data;
    });
    file2_data = fs.readFileSync(file2, { encoding: "utf-8" }, function(error, data) {
      if (error) { console.log(error); }
      return data;
    });
  };

  var countriesData = JSON.parse(file1_data)[1];
  var teamsData = JSON.parse(file2_data);

  countriesData.forEach(function(country) {
    countries[country.id] = [country.name, country.capitalCity, country.longitude, country.latitude];
  });

  teamsData.forEach(function(team) {
    teams[team.fifa_code] = team.country;
  });

  var nameNonMatches = searchByName();
  nonmatches = searchByCode(nameNonMatches);

  finalData = matches;
  addManualInput("ENG", countries["GBR"]);

  console.log("Final data:");
  console.log(finalData);
  // console.log("matches size: " + _.size(matches));

  var writePath = path.join(__dirname, "..", "/generated_files/fifa_capitals.json");
  fs.writeFileSync(writePath, JSON.stringify(finalData), { encoding: "utf8" },
    function(err) {
    if (err) throw err;
  });
  console.log("Saved file to ../generated_files/fifa_capitals.json");
};

var searchByName = function() {
  var nameMatches = {};
  var nameNonMatches = {};

  for (var fifa_code in teams) {
    var match_id = null;
    for (var id in countries) {
      if (countries[id][0] == teams[fifa_code]) {
        match_id = countries[id][0];
        nameMatches[fifa_code] = countries[id];
        break;
      }
    }
    if (!match_id) { nameNonMatches[fifa_code] = teams[fifa_code]; }
  }

  matches = nameMatches;
  return nameNonMatches;
};

var searchByCode = function(nonmatches) {
  var codeMatches = {};
  var codeNonMatches = {};

  var search = null;
  if (nonmatches) { search = nonmatches; } else { search = teams; }

  for (var fifa_code in search) {
    var match_id = null;
    for (var id in countries) {
      if (id == fifa_code) {
        var match_id = id;
        codeMatches[id] = countries[id];
        break;
      }
    }
    if (!match_id) { codeNonMatches[fifa_code] = search[fifa_code]; }
  }

  for (var code in codeMatches) { matches[code] = codeMatches[code]; }
  return codeNonMatches;
};

var addManualInput = function(fifa_code, country_info) {
  finalData[fifa_code] = country_info;
};

var countries_data = path.join(__dirname, "..", "/data_files/countries.json");
var teams_data = path.join(__dirname, "..", "/data_files/teams.json");

getMatches(countries_data, teams_data);