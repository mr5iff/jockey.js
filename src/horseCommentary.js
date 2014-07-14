var cheerio = require('cheerio');
var http = require('http');

var moment = require('moment');


var now = new Date(Date.now());
var daysOfYear = [];
//Date(2009, 9, 1) is first date

for (var d = new Date(2014,5, 27); d <= now; d.setDate(d.getDate() + 1)) {
    if (d.getDay() == 2 ||d.getDay() == 5)
      daysOfYear.push(moment(d).format('DD/MM/YYYY'));
}

var url = "http://www.hkjc.com/chinese/racing/btresult.asp?date=20/06/2014&batchNo=1#";

// Utility function that downloads a URL and invokes
// callback with the data.
function download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      return callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}


function url_jc(date, lang){
  var language;

  switch (lang){
    case "en":
      language = "english";
      break;
    default:
      language = "chinese";
  }
  return "http://www.hkjc.com/" + language +"/racing/btresult.asp?date=" + date +"&batchNo=1#";
}

function handleComments($, lang, callback){
  callback = callback || console.log; // default operation: logging
  var columnWidth, filterRegex;

  switch (lang){
    case "en":
      columnWidth = "241";
      filterRegex = /Comment/;
      break;
    default:
      columnWidth = "216";
      filterRegex = /評述$/;
  }

  $("TD[width="+columnWidth+"]").each(function(i,elem){
    if (!filterRegex.test($(elem).text()) && !/^\s*$/.test($(elem).text()))
      callback.call(this, $(elem).text());
  })
}

function jc_createJSON($, lang, callback){
  callback = callback || console.log; // default operation: logging

  var header = ['horse', 'jockey', 'trainer', 'draw', 'gear', 'lbw', 'runningPosition', 'time', 'result', 'comment'];

  //filter all the data row
  // $('.bigborder').find('tr:not(:has(table))')
  //   .filter(function(i,el){
  //     return !/header/.test($(this).children().first().attr('class'));
  //   })
  //   .map(function(i,el){
  //     var result = {};

  //     $(el).children().each(function(i,el){
  //         result[header[i]] = $(el).find('*:not(:has(*))').text(). replace(/^\s*/, "");
  //     });

  //     console.log( result);
  //   });
  var results = [];

 $('.bigborder').each(function(j,el){
    $(el).find('tr:not(:has(table))')
    .filter(function(i,el){
      return !/header/.test($(this).children().first().attr('class'));
    })
    .map(function(i,el){
      var row = {};

      $(el).children().each(function(i,el){
          row[header[i]] = $(el).find('*:not(:has(*))').text(). replace(/^\s*/, "");
      });

      row['batch'] = j+1;
      
      results.push(row);
    });
    callback.call(this, results);
  });
}

function getHeader($){
  var header = [];
    $('.bigborder').find("tr").first().children().find('div:not(:has(*))')
        .each(function(i,el){
          header.push( $(el).text().replace(/\s*/g,""));
        });
  return header.length ? header : NULL;
}

function horseComments(lang, operation, dates, callback){
  operation = operation || handleComments;
  dates = dates || daysOfYear;
  var allResults = [];

  dates.map(function(d,i){
    var dailyResults;
    download(url_jc(d,lang), function(data) {
      if (data) {
        //data = htmlCleansing(data);
        var $ = cheerio.load(data);
        $('br').remove();
        var date = moment(d);
        var results = operation($,lang);

        dailyResults = {
          date: date,
          results: results
        };
        allResults.push(dailyResults);
      //handleComments($,lang);
      }
      else {
        console.log("error"); 
      }

    });
    
  });
  return allResults;
}

// function horseComments(lang, operation, dates, callback){
//   operation = operation || handleComments;
//   dates = dates || daysOfYear;
//   var allResults = [];

//   dates.map(function(d,i){
//     var dailyResults;
//     download(url_jc(d,lang), function(data) {
//       if (data) {
//         //data = htmlCleansing(data);
//         var $ = cheerio.load(data);
//         $('br').remove();
//         var date = moment(d);
//         var results = operation($,lang);

//         dailyResults = {
//           date: date,
//           results: results
//         };
//         allResults.push(dailyResults);
//       //handleComments($,lang);
//       }
//       else {
//         console.log("error"); 
//       }
//     allResults.forEach(function(d,i){
//       console.log(d);
//     })
//     });
    
//   });
//   return allResults;
// }

horseComments("en",jc_createJSON);

// download2("http://bet.hkjc.com/football/getXML.aspx?match=81372&pooltype=all&isLiveBetting=false&MSN=MLIST@137,POOLDEF@558,PDIV@74,TOURN_POOLDEF@34,O_HAD_M@126,O_FHA_M@74,O_HHA_M@87,O_HDC_M@67,O_HIL_M@122,O_FHL_M@80,O_CHL_M@142,O_OOE_M@35,O_HFT_M@57,O_TTG_M@56,O_CRS_M@148,O_FCS_M@54,O_FTS_M@72,O_FGS_M@29,O_SPC_M@29,O_TQL_M@49,J_ALL_M@559", console.log)

// download(url, function(data) {
//   if (data) {
//     var $ = cheerio.load(data);
//     // $('TD[width="216"]').get().map(function(d,i){
//     // 	console.log(d.childen().text());
//     // 	console.log(i + '-------------------');
//     // });
// 	$('TD[width="216"]').each(function(i,elem){
// 		console.log($(elem).text());
// 	})
//   }
//   else console.log("error");  
// });