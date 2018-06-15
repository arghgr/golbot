@worldcupgolbot
======

A Twitter bot that tweets the word "GOL", with varying numbers of Os, whenever a goal is scored in the 2014 FIFA World Cup. Inquiries can be directed @[arghgr](https://twitter.com/arghgr).

Much thanks to:
* http://worldcup.sfg.io/
* http://data.worldbank.org/
* http://thenounproject.com/term/soccer/23509/
* https://en.wikipedia.org/wiki/FIFA_World_Cup
* http://api.football-data.org

======

### Documentation

1. Move outdated ./generated_files and ./data_files into ./past/[year]
2. Make sure ./generated_files exists and is empty
3. Make sure ./data_files exists and is empty
4. Save [api.worldbank.org/countries?per_page=300&format=json](http://api.worldbank.org/countries?per_page=300&format=json) as ./data_files/countries.json
5. Save [worldcup.sfg.io/teams](worldcup.sfg.io/teams) as ./data_files/teams.json
6. Running each file in ./generators creates the JSON in ./generated_files
7. Move ./generated_files/latin_am_data.json to ./data_files/latin_am_data.json
8. Manually update ./data_files/latin_am_data.json with data for each team
