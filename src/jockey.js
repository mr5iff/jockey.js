'use strict';

var jockey = (function(){
	//dependencies
	var cheerio = require('cheerio');
	var http = require('http');
	var moment = require('moment');


	//default settings
	var lang = "en"; //default language
	var dateFormat = 'DD/MM/YYYY'
	var firstDate = moment("2009-10-01");

	var headerEng = ['horse',
	 'jockey',
	 'trainer',
	 'draw',
	 'gear',
	 'lbw',
	 'runningPosition',
	 'time',
	 'result',
	 'comment'];

	var headerChi = [ '馬名',
     '騎師',
     '練馬師',
     '排位',
     '馬匹配備',
     '頭馬距離',
     '沿途走位',
     '完成時間',
     '結果',
     '沿途走勢評述' ];

	var headerDict ={
		'horse' : '馬名',
		'jockey' : '騎師',
		'trainer' : '練馬師',
		'draw' : '排位',
		'gear' : '馬匹配備',
		'lbw' : '頭馬距離',
		'runningPosition' : '沿途走位',
		'time' : '完成時間',
		'result' : '結果',
		'comment' : '沿途走勢評述'
};

	var blanksPattern = /(\s|&nbsp;)+/g

	var setLang = function(language){
		if (language){
			lang = language;
		}else{
			return lang;
		}
	}

	//getting an array of dates which have practice game
	var getDates = function(startDate, endDate, dateFormat){
		var dates = [];
		var startDate = moment(startDate) || moment("2009-10-01");
		var endDate = moment(endDate) || moment();
		var dateFormat = 'YYYY-MM-DD';

		// need to specify 'day', which is the unit of comparison
		for (var d = startDate; d.isBefore(endDate, 'day') || d.isSame(endDate, 'day') ; d.add('days',1)) {
    	if (d.day() == 2 || d.day() == 5)
      		dates.push(d.format(dateFormat));
		}

		return dates;
	};

	//getting the url of practice game
	var getUrl = function(date, lang){
		var language;

		  switch (lang){
		    case "en":
		      language = "english";
		      break;
		    default:
		      language = "chinese";
		  }
		  return "http://www.hkjc.com/" + language +"/racing/btresult.asp?date=" + moment(date).format(dateFormat) +"&batchNo=1#";
	};

	//downloading data from a given url
	var download = function(url, callback) {
	  http.get(url, function(res) {
	    var data = "";
	    res.on('data', function (chunk) {
	      data += chunk;
	    });
	    res.on('end', function(err) {
	      // callback.call(this, data, err);
	      callback( data, err);
	    });
	  }).on('error', function() {
	    callback(null);
	  });
	};

	var accessor = function($, date, option, callback) {
		var daily;

		switch(option){

			case 'batchInfo':
				var batches = [];
				$('td').filter(function(i,el) {
						return $(el).hasClass('subheader') && $(el).attr('colspan') === "2";
					})
					.each(function(i, el) {
					var subheader = $(el).text().replace(blanksPattern, ' ');
					// console.log(subheader);
					var trackCondition = $(el).parent().next().find(':nth-child(2)').find('font').first().text().replace(blanksPattern, ' ');
					batches.push({
						batch: i+1,
						// length: subheader,
						length: /\d+(?=(m|\u7c73))/.exec(subheader)[0],
						// trackCondition: trackCondition
						trackCondition: /:\s?(\S*)/.exec(trackCondition)[1]
					});
				});
				daily = {
					date : date.format(dateFormat),
					batches : batches
				};
				break;

			case 'result':
				accessor($,date, 'header', function(headerObj){
					var results = [];
					var header = headerObj.header;
					$('.bigborder').each(function(j,el){
					  $(el).find('tr:not(:has(table))')
					  .filter(function(i,el){
					    return !/header/.test($(this).children().first().attr('class'));
					  })
					  .each(function(i,el){
					    var row = {};

					    $(el).children().each(function(i,el){
					        row[header[i]] = $(el).find('*:not(:has(*))').text(). replace(/^\s*/, "");
					    });

					    //custom adding batch number, not in the table
					    row['batch'] = j+1;

					    // row['date'] = date.format(dateFormat);
					    // console.log(row);
					    results.push(row);
					  });
					});

					daily = {
						date : date.format(dateFormat),
						results : results
					};
				});
				break;

			case 'header':
				var header = [];
				$('.bigborder').first().find('[class$="subheader"]').each(function(i,el) {
					header.push($(el).children().text().replace(blanksPattern,''));
				});
				daily = {
					date: date.format(dateFormat),
					header: header
				}
				break;
		}
		callback.call(this,daily);
	}

	//generate an object of practice match results given a date
	var practiceMatch = function(date, infoType, callback){
		var results = [];
		var date = moment(date);
		infoType = infoType || 'result';

		download(getUrl(date, lang),function(data,err){
			if (data) {
				var $ = cheerio.load(data);
        $('br').remove(); //needed as the <br> will make some filters don't work
        accessor($, date, infoType,callback);

			} else{
				console.log("error....");
			}
		// if (callback && typeof(callback) === 'function')
		// 	callback.call(this, {results: results, date: date.format(dateFormat)}, err);
		});
	};

	var practiceMatches = function(startDate, endDate, infoType, callback){
		var startDate = moment(startDate) || firstDate;
		var endDate = moment(endDate) || moment();

		getDates(startDate, endDate).forEach(function(date, i){
			var dailyResults;
			practiceMatch(date,infoType,function(d){
				if (callback && typeof(callback) === 'function')
					callback.call(this, d);
			});
		});
	};

	return {
		dates : getDates,
		match : practiceMatch,
		matches : practiceMatches,
		lang : setLang
	};
})();


jockey.lang("chi");

jockey.match("2014-06-27", 'batchInfo', function(d){
	console.log(d);
});

jockey.match("2014-06-27", 'header', function(d){
	console.log(d);
});

jockey.match("2014-06-27", 'result', function(d){
	console.log(d);
});

jockey.lang("en");
jockey.match("2014-06-27", 'batchInfo', function(d){
	console.log(d);
});

jockey.match("2014-06-27", 'header', function(d){
	console.log(d);
});

jockey.match("2014-06-27", 'result', function(d){
	console.log(d);
});

// console.log(jockey.dates("2014-06-22","2014-06-27"));

// console.log(jockey.dates());

// var JSON = require('json3');

// jockey.matches("2009-09-01",Date.now(),'result',function(d){
// 	// console.log(JSON.stringify(d));
// 	JSON.stringify(d);
// });

// console.log(r);

module.exports = exports = jockey;