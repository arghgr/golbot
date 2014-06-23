var express = require('express');
var fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');

var getMatches = function(file) {
  if (file) {
    fs.readFile(file, { encoding: "utf-8" }, function(error, data) {
      if(!error){
        var $ = cheerio.load(data);
        var matches = JSON.parse(data);
      } else {
        console.log(error);
      }
    });
  } else {
    request({
      url: "http://worldcup.sfg.io/matches/today",
      headers: {
        "User-Agent": "worldcupgolbot by @arghgr"
      }
    }, function(error, response, data){
      if(!error){
        console.log(response);
        var $ = cheerio.load(data);
        var matches = JSON.parse(data);
      } else {
        console.log(error);
      }
    });
  }
};