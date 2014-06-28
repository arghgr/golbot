var fs = require("fs");
var haversine = require("haversine");

// O CALCULATOR
// Given a team's FIFA code, oCalc returns the number of Os to tweet in the word "GOL".
// It is a function of:
// 1. The distance (calculated with the Haversine formula) between the team's capital city
// and Cuiaba, which is the geographic center of South America
// (Mexico's score is slightly adjusted for its distance from South America proper)
// 2. The number of players on the team who are Latin American or of Latin American descent

var teamCapitals = {};
var teamDistances = {};
var furthest = 0;
var closest = 1000;
var cuiaba = {
  latitude: -15.595833,
  longitude: -56.096944
};

var fifaCapitalsData = fs.readFileSync("data_files/fifa_capitals.json", { encoding: "utf-8" }, function(error, data) {
    if (error) throw error;
    return data;
});

var parseCapitals = function() {
  var fifaCapitals = JSON.parse(fifaCapitalsData);
  for (var key in fifaCapitals) {
    var value = fifaCapitals[key];
    teamCapitals[key] = {
      latitude: value[3],
      longitude: value[2]
    };
  }
};

var calculateDistances = function() {
  var capitalCoords = null;
  var distance = null;
  for (var capital in teamCapitals) {
    capitalCoords = teamCapitals[capital];
    distance = Math.round(haversine(capitalCoords, cuiaba, { unit: 'km' }));
    teamDistances[capital] = distance;
    if (distance > furthest) { furthest = distance; }
    if (distance < closest) { closest = distance; }
  }
};

var getDistanceScore = function(team_code) {
  console.log(team_code);
  var distance = teamDistances[team_code];
  var score = Math.round((distance * 10 - closest * 10)/(closest - furthest)) + 10;
  if (team_code == "MEX") { score += 1; }
  console.log(distance);
  console.log(score);
  return distance;
};

var getLatinAmPlayers = function(team_code) {
  console.log(team_code);
};

var oCalc = function(team_code) {
  console.log("\n000000 CALCULATING Os 000000");
  var o_number = 10;
  var distanceScore = getDistanceScore(team_code);
  console.log("number of Os: " + o_number);
  console.log("0000000000000000000000000000");
  return o_number;
};

// Test:
parseCapitals();
calculateDistances();
console.log("furthest: " + furthest);
console.log("closest: " + closest);
oCalc("BRA");
oCalc("URU");
oCalc("ARG");
oCalc("CRC");
oCalc("MEX");
oCalc("USA");
oCalc("ESP");
oCalc("FRA");
oCalc("AUS");
oCalc("JPN");
oCalc("KOR");

exports.oCalc = oCalc;