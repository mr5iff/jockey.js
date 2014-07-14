var moment = require('moment');

var now = new Date(Date.now());
var daysOfYear = [];
for (var d = new Date(2013, 0, 1); d <= now; d.setDate(d.getDate() + 1)) {
    if (d.getDay() == 2 ||d.getDay() == 5)
      daysOfYear.push(moment(d).format('DD/MM/YYYY'));
}

// console.log(daysOfYear);