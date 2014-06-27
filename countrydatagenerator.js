var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var _ = require("underscore");

var getMatches = function(file1, file2) {
  var countries = {};
  var teams = {};
  var matches = {};
  var nonmatches = {};

  if (file1 && file2) {
    fs.readFile(file1, { encoding: "utf-8" }, function(error, data) {
      if(!error){
        var countriesData = JSON.parse(data)[1];
        countriesData.forEach(function(country) {
          countries[country.id] = [country.name, country.capitalCity, country.longitude, country.latitude];
        });
        fs.readFile(file2, { encoding: "utf-8" }, function(error, data) {
          if(!error){
            var teamsData = JSON.parse(data);
            teamsData.forEach(function(team) {
              teams[team.fifa_code] = team.country;
            });
            var nameNonMatches = searchByName();
            nonmatches = searchByCode(nameNonMatches);

            console.log("Final tally of matches:");
            console.log(matches);
            // console.log("matches size: " + _.size(matches));

            console.log("Final tally of nonmatches:");
            console.log(nonmatches);
            // console.log("nonmatches size: " + _.size(nonmatches));
          } else {
            console.log(error);
          }
        });
      } else {
        console.log(error);
      }
    });
  }

  var searchByName = function() {
    var nameMatches = {};
    var nameNonMatches = {};

    for (var fifa_code in teams) {
      var match_id = null;
      for (var id in countries) {
        if (countries[id][0] == teams[fifa_code]) {
          match_id = countries[id][0];
          nameMatches[id] = countries[id];
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
};

var countries_data = path.join(__dirname + '/data_files/countries.json');
var teams_data = path.join(__dirname + '/data_files/teams.json');

getMatches(countries_data, teams_data);