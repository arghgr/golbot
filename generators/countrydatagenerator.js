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
// http://api.worldbank.org/countries?per_page=300&format=json
// http://worldcup.sfg.io/teams

var matchCountryWithTeam = function(countries_path, teams_path) {
  var finalData = {};

  var countries = parseCountriesData(countries_path);
  var teams = parseTeamsData(teams_path);
  var nameResults = matchByName(teams, countries);
  var codeResults = matchByCode(teams, countries, nameResults.matches, nameResults.nameNonMatches);

  var matches = Object.assign(nameResults.matches, codeResults.matches);
  matches = addManualMatches(teams, countries, matches);

  var sortedFifaCodes = _.sortBy(Object.keys(matches), function(fifaCode){ return fifaCode; })
  sortedFifaCodes.forEach(function(fifaCode) {
    finalData[fifaCode] = matches[fifaCode];
  });

  console.log("Final data:");
  console.log(finalData);
  console.log("finalData size: " + _.size(finalData));

  var writePath = path.join(__dirname, "..", "/generated_files/fifa_capitals.json");
  fs.writeFileSync(writePath, JSON.stringify(finalData, null, 2), { encoding: "utf8" },
    function(err) {
    if (err) throw err;
  });
  console.log("Saved file to ../generated_files/fifa_capitals.json");
};

var parseCountriesData = function(countries_path) {
  var countries_data = null;
  var countries = {};
  if (!countries_path) throw Error;
  countries_data = fs.readFileSync(countries_path, { encoding: "utf-8" }, function(error, data) {
    if (error) { console.log(error); }
    return data;
  });
  var countriesData = JSON.parse(countries_data)[1];
  var latinAmCountries = getLatinAmCountries(countriesData);

  countriesData.forEach(function(country) {
    countries[country.id] = [
      country.name, country.capitalCity,
      country.longitude, country.latitude,
      latinAmCountries[country.id] ? true : false
    ];
  });
  return countries;
};

var getLatinAmCountries = function(countriesData) {
  var excludedCodes = {
    ABW: 'Aruba',
    ATG: 'Antigua and Barbuda',
    BHS: 'Bahamas, The',
    BLZ: 'Belize',
    BRB: 'Barbados',
    CUW: 'Curacao',
    CYM: 'Cayman Islands',
    DMA: 'Dominica',
    GRD: 'Grenada',
    GUY: 'Guyana',
    JAM: 'Jamaica',
    KNA: 'St. Kitts and Nevis',
    LCA: 'St. Lucia',
    MAF: 'St. Martin (French part)',
    SUR: 'Suriname',
    SXM: 'Sint Maarten (Dutch part)',
    TCA: 'Turks and Caicos Islands',
    TTO: 'Trinidad and Tobago',
    VCT: 'St. Vincent and the Grenadines',
    VGB: 'British Virgin Islands',
    VIR: 'Virgin Islands (U.S.)'
  }
  var latinAmCountries = {};
  countriesData.filter(function(country) {
    return country.region.id === 'LCN';
  }).map(function(country) {
     if (!excludedCodes[country.id]) latinAmCountries[country.id] = country.name;
  });

  console.log("latinAmCountries: ", latinAmCountries);
  console.log("latinAmCountries size:", _.size(latinAmCountries));

  return latinAmCountries;
}

var parseTeamsData = function(teams_path) {
  var teams_data = null;
  var teams = {};
  if (!teams_path) throw Error;
  teams_data = fs.readFileSync(teams_path, { encoding: "utf-8" }, function(error, data) {
    if (error) { console.log(error); }
    return data;
  });
  var teamsData = JSON.parse(teams_data);
  teamsData.teams.forEach(function(team) {
    if (team.fifa_code && team.country) { // worldcup.sfg.io format
      teams[team.fifa_code] = team.country;
    } else if (team.code && team.name) { // api.football-data.org format
      teams[team.code] = team.name;
    } else {
      console.log("What format are these teams in?")
    }
  });
  return teams;
};

var matchByName = function(teams, countries) {
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

  return { matches: nameMatches, nameNonMatches: nameNonMatches };
};

var matchByCode = function(teams, countries, matches, nonmatches) {
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

  return { matches: codeMatches, nonmatches: codeNonMatches };
};

var addManualMatches = function(teams, countries, matches) {
  var manualInputs = [
    {
      fifa_country: "England",
      fifa_code: "ENG",
      country_code: "GBR"
    }
  ]
  manualInputs.forEach(function(manualInput) {
    if (_.find(teams, function(team){ return team === manualInput.fifa_country })) {
      matches[manualInput.fifa_code] = countries[manualInput.country_code];
      console.log("* Manually added: " + manualInput.fifa_code);
    }
  });
  return matches;
};

// http://api.worldbank.org/countries?per_page=300&format=json
var countries_data = path.join(__dirname, "..", "/data_files/countries.json");

// http://worldcup.sfg.io/teams
// var teams_data = path.join(__dirname, "..", "/data_files/teams.json");

// http://api.football-data.org/v1/competitions/467/teams
var teams_data = path.join(__dirname, "..", "/data_files/teams-footballdata.json");

matchCountryWithTeam(countries_data, teams_data);
