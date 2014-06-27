var http = require("http");
var request = require("request");
var url = require("url");
var twit = require("twit");

var o = require("./ocalculator");


var T = new twit({
  consumer_key: process.env.GB_KEY,
  consumer_secret: process.env.GB_SECRET,
  access_token: process.env.GB_TOKEN,
  access_token_secret: process.env.GB_TOKEN_SECRET
});

var golTweet = function(team_code, gol_event) {
  var o_number = o.oCalc(team_code);
  // var o_number = 10;
  var gol = "G" + Array(o_number).join("O") + "L";
  var tweet = gol + " #" + team_code + "\nby " + gol_event.player + " in minute " + gol_event.time;
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
  console.log(tweet);
  // console.log("Posting Tweet");
  // var statusUpdate = tweet;
  // T.post('statuses/update', { status: statusUpdate }, function(err, reply) {
  //     if (err) {
  //         console.dir(err);
  //     } else {
  //         console.dir(reply);
  //     }
  // });
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
};

exports.golTweet = golTweet;