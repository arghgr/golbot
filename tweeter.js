var http = require("http");
var request = require("request");
var url = require("url");
var twit = require("twit");

var o = require("./ocalculator");

var isProduction = process.env.IS_PRODUCTION ? JSON.parse(process.env.IS_PRODUCTION) : false;

if (!isProduction) {
  var twitKeys = require("./config/keys");
  var T = new twit({
    consumer_key: twitKeys.GB_KEY,
    consumer_secret: twitKeys.GB_SECRET,
    access_token: twitKeys.GB_TOKEN,
    access_token_secret: twitKeys.GB_TOKEN_SECRET
  });
} else {
  var T = new twit({
    consumer_key: process.env.GB_KEY,
    consumer_secret: process.env.GB_SECRET,
    access_token: process.env.GB_TOKEN,
    access_token_secret: process.env.GB_TOKEN_SECRET
  });
}

var postTweet = function(tweet) {
  var statusUpdate = tweet;
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
  console.log(statusUpdate);
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
  try {
    T.post("statuses/update", { status: statusUpdate }, function(err, reply) {
      try {
        if (err || !reply.id_str || !reply.created_at) throw err;
        console.log("postTweet id: " + reply.id_str + " | created_at: " + reply.created_at);
      } catch (e) {
        console.error("postTweet e: ", e.message || e);
      }
    });
  } catch (error) {
    console.error("postTweet error: ", error);
  }
};

var penaltyTweet = function(team_code, penalties) {
  var o_number = o.oCalc(team_code);
  if (o_number) {
    var gol = "G" + Array(o_number + 1).join("O") + "L";
    var gols = Array(penalties).join("GOL ") + gol;
    var bang = Array(o_number + 1).join("!");
  } else {
    var gol = "GOL";
    var bang = "!";
  }
  var tweet = gols + "\n#" + team_code + " wins in penalty shoot-out" + bang;
  postTweet(tweet);
};

var ownGolTweet = function(team_code, opponent_code, gol_event) {
  var o_number = o.oCalc(opponent_code);
  var ay_number = o.oCalc(team_code);
  var gol = "GOL";
  var ay = "AY";
  if (o_number) {
    gol = "G" + Array(o_number + 1).join("O") + "L";
  }
  if (ay_number) {
    ay = "A" + Array(ay_number + 1).join("Y");
  }
  var tweet = gol + " #" + opponent_code
    + "\nown gol by #" + team_code + "'s " + gol_event.player + " in minute " + gol_event.time
    + "\n" + ay;
  postTweet(tweet);
};

var golTweet = function(team_code, gol_event) {
  var o_number = o.oCalc(team_code);
  var gol = "GOL";
  if (o_number) {
    gol = "G" + Array(o_number + 1).join("O") + "L";
  }
  var tweet = gol + " #" + team_code + "\nby " + gol_event.player + " in minute " + gol_event.time;
  postTweet(tweet);
};

if (!isProduction) {
  // Tests:
  // golTweet("TUN", {
  //   id: 193,
  //   type_of_event: "goal-penalty",
  //   player: "Ferjani SASSI",
  //   time: "35'"
  // });
  // ownGolTweet("NGA", "CRO", {
  //   id: 81,
  //   type_of_event: "goal-own",
  //   player: "Oghenekaro ETEBO",
  //   time: "32'"
  // });
  // ownGolTweet("MEX", "SWE", {
  //   id: 761,
  //   type_of_event: "goal-own",
  //   player: "Edson ALVAREZ",
  //   time: "74'"
  // });
}

exports.golTweet = golTweet;
exports.ownGolTweet = ownGolTweet;
exports.penaltyTweet = penaltyTweet;
