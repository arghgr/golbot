@worldcupgolbot
======

A Twitter bot that tweets the word "GOL", with varying numbers of Os, whenever a goal is scored in the 2014 FIFA World Cup. Inquiries can be directed @[arghgr](https://twitter.com/arghgr).

Much thanks to:
* http://worldcup.sfg.io/
* http://data.worldbank.org/
* http://www.kimonolabs.com/worldcup/explorer
* http://thenounproject.com/term/soccer/23509/
* https://en.wikipedia.org/wiki/2014_FIFA_World_Cup
* http://api.football-data.org

======

###Documentation

* Make sure ./generated_files exists and is empty
* Make sure ./data_files exists and is empty
* Save [api.worldbank.org/countries?per_page=300&format=json](http://api.worldbank.org/countries?per_page=300&format=json) as ./data_files/countries.json
* Save [worldcup.sfg.io/teams](worldcup.sfg.io/teams) as ./data_files/teams.json
* Running each file in ./generators creates the JSON in ./generated_files
* Manually update ./generated_files/latin_am_data.json with data for each team
