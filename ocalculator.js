

// Latitude, Longitude
var cuiaba = [-15.595833,-56.096944];

var teamCapitals = {
  "MEX": [19.427,-99.1276]
};

var getTeamDistance = function(team_code) {
  console.log(team_code);
  var capital = teamCapitals[team_code];
  console.log(capital);
};

var oCalc = function(team_code) {
  console.log("000000 CALCULATING Os 000000");
  var o_number = 10;
  var team = null;
  // getTeamDistance(team_code);
  console.log("number of Os: " + o_number);
  console.log("0000000000000000000000000000");
  return o_number;
};

// Test:
// oCalc("MEX");

exports.oCalc = oCalc;