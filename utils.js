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
      } catch (e_parseData) {
        console.error("parseData error: ", e_parseData);
        if (parseCallback) parseCallback(parsedData);
      }
    }
    if (file) {
      try {
        if (!isProduction) console.log("runScraper file: ", file);
        fs.readFile(file, { encoding: "utf-8" }, function(err, data) {
          try {
            if (err) throw err;
            parseData(data);
          } catch (e_readFile) {
            console.error("readFile error: ", e_readFile);
            if (parseCallback) parseCallback(parsedData);
          }
        });
      } catch (e_file) {
        console.error("file error: ", e_file);
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
          try {
            if (err) throw err;
            parseData(data);
          } catch (e_request) {
            console.error("request error: ", e_request);
            if (parseCallback) parseCallback(parsedData);
          }
        });
      } catch (e_url) {
        console.error("url error: ", e_url);
        if (parseCallback) parseCallback(parsedData);
      }
    }
  } catch (error) {
    console.error("runScraper error: ", error);
    if (parseCallback) parseCallback(parsedData);
  }
}

exports.runScraper = runScraper;
