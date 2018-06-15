var fs = require("fs");
var _ = require("underscore");
var haversine = require("haversine");

// O CALCULATOR
// Given a team's FIFA code, oCalc returns the number of Os to tweet in the word "GOL".
// It is a function of:
// 1. The distance (calculated with the Haversine formula) between the team's capital city
// and Cuiaba, which is the geographic center of South America
// (Mexico's score is slightly adjusted for its distance from South America proper)
// 2. The number of players on the team who have Latin American or Hispanic backgrounds
// 3. The number of players on the team who play for Latin American or Hispanic clubs
// Hispanic here refers to Spanish-speaking or formerly Spanish areas, so for
// these purposes, Spain and the Philippines are included, but not Portugal.

var latinAmData = {};

var fifa_data = null;
fifa_data = fs.readFileSync("generated_files/fifa_data.json", { encoding: "utf-8" }, function(error, data) {
    if (error) throw error;
    return data;
});

var latin_am_data = null;
latin_am_data = fs.readFileSync("data_files/latin_am_data.json", { encoding: "utf-8" }, function(error, data) {
    if (error) throw error;
    return data;
});

var parseCapitals = function(fifa_data) {
  var fifaData = JSON.parse(fifa_data);
  var teamCapitals = {};
  var value = null;
  for (var key in fifaData) {
    value = fifaData[key];
    teamCapitals[key] = {
      latitude: value[3],
      longitude: value[2]
    };
  }
  return teamCapitals;
};

var calculateDistances = function(teamCapitals) {
  var capitalCoords = null;
  var distance = null;
  var teamDistances = {};
  var cuiaba = {
    latitude: -15.595833,
    longitude: -56.096944
  };
  for (var capital in teamCapitals) {
    capitalCoords = teamCapitals[capital];
    distance = Math.round(haversine(capitalCoords, cuiaba, { unit: 'km' }));
    teamDistances[capital] = distance;
  }
  return teamDistances;
};

var getDistanceScore = function(team_code) {
  console.log(team_code);
  var scoreMax = 10;
  var distance = teamDistances[team_code];
  var furthest = teamDistances[_.max(Object.keys(teamDistances), function(d) { return teamDistances[d]; })];
  var closest = teamDistances[_.min(Object.keys(teamDistances), function(d) { return teamDistances[d]; })];
  var distanceScore = Math.abs(Math.ceil(scoreMax - (scoreMax * (distance / (furthest - closest || 1)))));
  if (team_code == "MEX") { distanceScore += 1; }
  return distanceScore;
};

var parseLatinAmData = function(la_data) {
  var data = JSON.parse(la_data);
  var latinAmBg = data["background"];
  var latinAmClubs = data["clubs"];
  return {
    bg: latinAmBg,
    clubs: latinAmClubs
  }
};

var getBgClubScore = function(team_code, latinAmBg, latinAmClubs) {
  var scoreMax = 10;
  var teamSize = 23;
  var bgScore = ((latinAmBg[team_code] * scoreMax) / teamSize);
  console.log("bgScore: " + bgScore);
  var clubScore = ((latinAmClubs[team_code] * scoreMax) / teamSize);
  console.log("clubScore: " + clubScore);
  var bgClubScore = Math.ceil(bgScore + clubScore);
  return bgClubScore;
};

var oCalc = function(team_code) {
  console.log("\n000000 CALCULATING Os 000000");
  var o_number = 1;
  var distanceScore = getDistanceScore(team_code);
  console.log("distanceScore: " + distanceScore);
  var bgClubScore = getBgClubScore(team_code, latinAmData.bg, latinAmData.clubs);
  o_number = distanceScore + bgClubScore;
  console.log("number of Os: " + o_number);
  console.log("0000000000000000000000000000");
  return o_number;
};

var teamCapitals = parseCapitals(fifa_data);
var teamDistances = calculateDistances(teamCapitals);
latinAmData["bg"] = parseLatinAmData(latin_am_data).bg;
latinAmData["clubs"] = parseLatinAmData(latin_am_data).clubs;


var isProduction = process.env.IS_PRODUCTION ? JSON.parse(process.env.IS_PRODUCTION) : false;

if (!isProduction) {
  // Tests:
  // for (var country in latinAmData.bg) oCalc(country);
}

exports.oCalc = oCalc;
