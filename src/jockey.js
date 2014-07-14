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
	var header = ['horse', 'jockey', 'trainer', 'draw', 'gear', 'lbw', 'runningPosition', 'time', 'result', 'comment'];

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

	//generate an object of practice match results given a date
	var practiceMatch = function(date, callback){
		var results = [];
		var date = moment(date);

		download(getUrl(date, lang),function(data,err){
			if (data) {
				var $ = cheerio.load(data);
        $('br').remove(); //needed as the <br> will make some filters don't work

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
				    row['date'] = date.format(dateFormat);
				    // console.log(row);
				    results.push(row);
				  });
				});
			} else{
				console.log("error....");
			}
		if (callback && typeof(callback) === 'function')
			callback.call(this, results, err);
		});
	};

	var practiceMatches = function(startDate, endDate, callback){
		var startDate = moment(startDate) || firstDate;
		var endDate = moment(endDate) || moment();

		getDates(startDate, endDate).forEach(function(date, i){
			var dailyResults;
			practiceMatch(date,function(d){
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


// console.log(jockey.getDates());

// jockey.match("2014-06-27", function(d){
// 	console.log(d);
// });

// console.log(jockey.dates("2014-06-22","2014-06-27"));

// console.log(jockey.dates());
jockey.lang("chi");

jockey.matches("2014-05-22","2014-06-27",function(d){
	console.log(d);
});

// console.log(r);

module.exports = exports = jockey;