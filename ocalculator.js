

var teams = [{"country":"Netherlands","alternate_name":"Holland","fifa_code":"NED","group_id":2},{"country":"Germany","alternate_name":null,"fifa_code":"GER","group_id":7},{"country":"Australia","alternate_name":null,"fifa_code":"AUS","group_id":2},{"country":"Iran","alternate_name":null,"fifa_code":"IRN","group_id":6},{"country":"Nigeria","alternate_name":null,"fifa_code":"NGA","group_id":6},{"country":"Spain","alternate_name":null,"fifa_code":"ESP","group_id":2},{"country":"Chile","alternate_name":null,"fifa_code":"CHI","group_id":2},{"country":"Croatia","alternate_name":null,"fifa_code":"CRO","group_id":1},{"country":"Cameroon","alternate_name":null,"fifa_code":"CMR","group_id":1},{"country":"Colombia","alternate_name":null,"fifa_code":"COL","group_id":3},{"country":"Mexico","alternate_name":null,"fifa_code":"MEX","group_id":1},{"country":"Ivory Coast","alternate_name":"Côte d'Ivoire","fifa_code":"CIV","group_id":3},{"country":"England","alternate_name":null,"fifa_code":"ENG","group_id":4},{"country":"Uruguay","alternate_name":null,"fifa_code":"URU","group_id":4},{"country":"Greece","alternate_name":null,"fifa_code":"GRE","group_id":3},{"country":"Japan","alternate_name":null,"fifa_code":"JPN","group_id":3},{"country":"Italy","alternate_name":null,"fifa_code":"ITA","group_id":4},{"country":"Costa Rica","alternate_name":null,"fifa_code":"CRC","group_id":4},{"country":"France","alternate_name":null,"fifa_code":"FRA","group_id":5},{"country":"Switzerland","alternate_name":null,"fifa_code":"SUI","group_id":5},{"country":"Ecuador","alternate_name":null,"fifa_code":"ECU","group_id":5},{"country":"Honduras","alternate_name":null,"fifa_code":"HON","group_id":5},{"country":"Argentina","alternate_name":null,"fifa_code":"ARG","group_id":6},{"country":"Bosnia and Herzegovina","alternate_name":"Bosnia-Herzegovina","fifa_code":"BIH","group_id":6},{"country":"Portugal","alternate_name":null,"fifa_code":"POR","group_id":7},{"country":"Ghana","alternate_name":null,"fifa_code":"GHA","group_id":7},{"country":"USA","alternate_name":null,"fifa_code":"USA","group_id":7},{"country":"Belgium","alternate_name":null,"fifa_code":"BEL","group_id":8},{"country":"Algeria","alternate_name":null,"fifa_code":"ALG","group_id":8},{"country":"Brazil","alternate_name":null,"fifa_code":"BRA","group_id":1},{"country":"Russia","alternate_name":null,"fifa_code":"RUS","group_id":8},{"country":"Korea Republic","alternate_name":"South Korea","fifa_code":"KOR","group_id":8}];

var oCalc = function(team_code) {
  console.log("000000 CALCULATING Os 000000");
  var o_number = 10;
  var team = null;
  for (i = 0; i < teams.length; i++) {
    // console.log(teams[i]);
    if (teams[i].fifa_code == team_code) {
      console.log("team: " + teams[i].country);
      team = team_code;
    }
  }
  console.log("number of Os: " + o_number);
  console.log("0000000000000000000000000000");
  return o_number;
};

// Test:
// oCalc("MEX");

exports.oCalc = oCalc;