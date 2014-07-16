jockey.js
=========

A NodeJS scrapper of HK Jockey Club data.

Currently support [practice game results](http://www.hkjc.com/english/racing/btresult.asp?date=27/06/2014&batchNo=1#) only.

#Install
```
npm install
```

#API
##jockey.lang(language)
Set the language of returned data. "en" is the default language.
```
jockey.lang("en"); // set the return language to be English
jocket.lang("chi"); // set the return language to be Chinese

jockey.lang(); // return the current language setting
```

##jockey.match(date, callback)
Get practice match results of a date, and pipe into the callback function.
The data is an array of object.

|Property|Descriptions|Example|
|--------|------------|-------|
|`horse`|Horse name|WONDERFUL MOMENTS|
|`jockey`|Jockey name|J Moreira|
|`trainer`|Trainer name|J Size|
|`draw`|Starting position|03|
|`gear`|Gear used in the game(SR, B, etc.)|B|
|`lbw`|Length Behind Winner|3-3/4L|
|`runningPosition`|first number: last 800m position; second number: last 500m position; third number: last 500m position|5 4 4|
|`time`|Time needed to finish|1.11.94|
|`result`|Passed or Failed or blank|Passed|
|`comment`|Brief commentary of the horse performance|Led all the way; never challenged.|
|`batch`|Which batch of match within the date|3|
|`date`|Date of practice match|27/06/2014|
