var request = require("request");
var fs = require("fs");
var _ = require("underscore");

var isProduction = process.env.IS_PRODUCTION ? JSON.parse(process.env.IS_PRODUCTION) : false;

var runScraper = function({
  file: file,
  url: url,
  parseCallback: parseCallback
} = { file: null, url: null, parseCallback: null }) {
  try {
    var e = null;
    var parsedData = [];
    var parseData = function(data) {
      try {
        parsedData = data;
        var isWrapped = data.indexOf("(");
        if (isWrapped > -1) { // Just in case it's a JSONP function
          parsedData = data.split("(").pop().split(")")[0];
        }
        parsedData = JSON.parse(parsedData);
        if (parseCallback) parseCallback(parsedData);
      } catch (e) {
        console.error("parseData e: ", e);
        if (parseCallback) parseCallback(parsedData);
      }
    }
    if (file) {
      try {
        if (!isProduction) console.log("runScraper file: ", file);
        fs.readFileSync(file, { encoding: "utf-8" }, function(err, data) {
          if (err) throw "readFile - " + err;
          console.log("file parsedData: ", parsedData);
          parsedData = parseData(data);
          if (parseCallback) parseCallback(parsedData);
        });
      } catch (e) {
        console.error("readFile e: ", e);
        if (parseCallback) parseCallback(parsedData);
      }

    } else if (url) {
      try {
        if (!isProduction) console.log("runScraper url: ", url);
        request({
          url: url,
          headers: {
            "User-Agent": "worldcupgolbot by @arghgr",
            "Content-Type": "application/json"
          }
        }, function(err, response, data){
          if (err) throw "request - " + err;
          parsedData = parseData(data);
        });
      } catch (e) {
        console.error("request e: ", e);
        if (parseCallback) parseCallback(parsedData);
      }
    }
  } catch (error) {
    console.error("runScraper error: ", error);
  }
}

exports.runScraper = runScraper;
