var http = require("http");
var request = require("request");
var url = require("url");
var twit = require("twit");

var o = require("./ocalculator");

var isProduction = JSON.parse(process.env.IS_PRODUCTION);

var T = new twit({
  consumer_key: process.env.GB_KEY,
  consumer_secret: process.env.GB_SECRET,
  access_token: process.env.GB_TOKEN,
  access_token_secret: process.env.GB_TOKEN_SECRET
});

var postTweet = function(tweet) {
  console.log("Posting Tweet");
  var statusUpdate = tweet;
  T.post("statuses/update", { status: statusUpdate }, function(err, reply) {
    if (err) {
        console.dir(err);
    } else {
        console.dir(reply);
    }
  });
};

var penaltyTweet = function(team_code) {
  var o_number = o.oCalc(team_code);
  if (o_number) {
    var gol = "G" + Array(o_number).join("O") + "L";
    var bang = Array(o_number).join("!");
  } else {
    var gol = "GOL";
    var bang = "!";
  }
  var tweet = gol + " #" + team_code + "\nin penalty shoot-out" + bang;
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
  console.log(tweet);
  if (isProduction) { postTweet(tweet); }
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
};

var ownGolTweet = function(team_code, opponent_code, gol_event) {
  var o_number = o.oCalc(opponent_code);
  if (o_number) {
    var gol = "G" + Array(o_number).join("O") + "L";
  } else {
    var gol = "GOL";
  }
  var event_time = gol_event.time;
  var time_string = event_time;
  var tweet = gol + " #" + opponent_code
    + "\nown gol by #" + team_code + "'s " + gol_event.player + " in minute " + time_string;
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
  console.log(tweet);
  if (isProduction) { postTweet(tweet); }
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
};

var golTweet = function(team_code, gol_event) {
  var o_number = o.oCalc(team_code);
  if (o_number) {
    var gol = "G" + Array(o_number).join("O") + "L";
  } else {
    var gol = "GOL";
  }
  var event_time = gol_event.time;
  var time_string = event_time;
  var tweet = gol + " #" + team_code + "\nby " + gol_event.player + " in minute " + time_string;
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
  console.log(tweet);
  if (isProduction) { postTweet(tweet); }
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
};

exports.golTweet = golTweet;
exports.ownGolTweet = ownGolTweet;
exports.penaltyTweet = penaltyTweet;