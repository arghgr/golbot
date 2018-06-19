var request = require("request");

var runScraper = function({
  file: file,
  url: url,
  parseCallback: parseCallback
} = { file: null, url: null, parseCallback: null }) {
  try {
    var parseData = function(data) {
      var parsedData = data;
      try {
        var isWrapped = data.indexOf("(");
        if (isWrapped > -1) { // Just in case it's a JSONP function
          parsedData = data.split("(").pop().split(")")[0];
        }
        parsedData = JSON.parse(parsedData);
      } catch (err) {
        console.error("parseData err: ", err);
      }
      return parsedData;
    }

    if (file) {
      fs.readFile(file, { encoding: "utf-8" }, function(err, data) {
        if (err) throw "readFile - " + err;
        var parsedData = parseData(data);
        if (parseCallback) parseCallback(parsedData);
      });
    } else if (url) {
      request({
        url: url,
        headers: {
          "User-Agent": "worldcupgolbot by @arghgr",
          "Content-Type": "application/json"
        }
      }, function(err, response, data){
        if (err) throw "request - " + err;
        var parsedData = parseData(data);
        if (parseCallback) parseCallback(parsedData);

      });
    }
  } catch (error) {
    console.error("runScraper error: ", error);
  }
}

exports.runScraper = runScraper;
