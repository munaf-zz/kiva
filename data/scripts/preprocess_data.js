// Use underscore.js. Import as `us` because node REPL writes over `_`
var us = require('underscore')._

// Get loans file. (25MB!)
var loans_big = require('./_LOANS').LOANS

// Flatten into array of JSON objects
var loans_flat = us(loans_big).flatten();

// Create array of loans to manipulate by clipping date.
var loans = us(loans_flat).chain().map(function(obj) { 
  obj['date'] = obj['date'].substring(0, 7); // YYYY-MM
  return obj;
}).sortBy(function(loan) { return loan['date']; }).value();

// Remove loans that have not received any money yet.
var loans_date = us(loans).filter(function(loan) {
  return (loan['amt'] > 0) && 
         (loan['stat'] != 'fundraising') && 
         (loan['stat'] != 'funded');
});

// Lookups for redundant values. Needed for compression.
var SECTORS = us(loans_date).chain().pluck('sect').uniq().value();
var COUNTRIES = us(loans_date).chain().pluck('loc').uniq().value();
var AMOUNTS = us(loans_date).chain().pluck('amt').uniq().value();
var MONTHS = us(loans_date).chain().pluck('date').uniq().value();
var PIDS = us(loans_date).chain().pluck('pid').uniq().value();
var PARTNERS = require('./partner_names').PARTNERS;

function worldNameConflicts() {
  var world = require('./world.node').WORLD;
  var map = us(world.features).chain().pluck('properties').pluck('name').value();
  var n = 0;
  //console.log(us.difference(COUNTRIES, map));
}

us(loans_date).each(function(loan) {
  //loan['date'] = us(MONTHS).indexOf(loan['date']);
  delete loan['id'];
  loan['$'] = loan['amt'];
  delete loan['amt'];
  loan['s'] = loan['stat'];
  delete loan['stat'];
  loan['sect'] = us(SECTORS).indexOf(loan['sect']);
  loan['loc']  = us(COUNTRIES).indexOf(loan['loc']);
  loan['$'] = us(AMOUNTS).indexOf(loan['$']);
  delete loan['cc'];
  if (loan['s'] == 'defaulted' || loan['s'] == 'refunded')
    loan['s'] = 0;
  else 
    loan['s'] = 1;
});
loans_date = us(loans_date).groupBy(function(loan) { 
  return loan['date'];
});

// Create array of loans grouped by Country.
var loans_country = us(loans_date).groupBy(function(obj) {
  return obj['loc'];
});

// Create object for focus+context bar chart. 
// { [month1, month2, ...],
//   [loancount1, moancount2, ...]
// }
function loans_timeline() {
  var months = us(loans_date).keys();
  var ln_arr = us(loans_date).values();
  var lengths = [];
  us(ln_arr).each(function(arr) {
    lengths.push(arr.length);
  });
  return lengths;
}
//console.log("var LOANS_OVER_TIME=%j;", loans_time());

function create_loan_data() {
  var output;
  var loansObj = us(loans);
  var months = loansObj.keys();
  var pids = loansObj.pluck('pid');
  var countries = loansObj.pluck('loc');
  
}
//console.log('made it here');
//console.log(loans_date['2005-04']);
function make_hierarchy() {
  // Index loans by Month >> Partner ID
  var loans_dp = us(loans_date).clone();
  us(loans_dp).each(function(loan_arr, key, obj) { 
    obj[key] = us(loan_arr).groupBy(function(loan) {
      return loan['pid']; 
    });
  });
  // Month >> Partner ID >> Country
  us(loans_dp).each(function(month_obj, month_key, month_list){
    us(month_list[month_key]).each(function(pid_arr, pid_key, pid_list){
      pid_list[pid_key] = us(pid_arr).groupBy(function(loan){
        return loan['loc']; 
      });
    }); 
  });
  // Month >> Partner ID >> Country >> Sector
  us(loans_dp).each(function(month_obj, month_key, month_list){
    us(month_list[month_key]).each(function(pid_arr, pid_key, pid_list){
      us(pid_list[pid_key]).each(function(loc_arr, loc_key, loc_list){
        loc_list[loc_key] = us(loc_arr).groupBy(function(loan) {
          return loan['sect']; 
        });
      });
    }); 
  });
  // Month >> Partner ID >> Country >> Sector >> Funded Range
  us(loans_dp).each(function(month_obj, month_key, month_list){
    us(month_list[month_key]).each(function(pid_arr, pid_key, pid_list){
      us(pid_list[pid_key]).each(function(loc_arr, loc_key, loc_list){
        us(loc_list[loc_key]).each(function(sect_arr, sect_key, sect_list){
          us(sect_list[sect_key]).each(function (loan) {
            delete loan['date'];
            delete loan['pid'];
            delete loan['loc'];
            delete loan['sect'];
          });
        });
      });
    }); 
  });
  return loans_dp;
}

// Produce the final data set for consumption by the visualization.
//console.log('{"ids": %j}', PARTNERS);
//worldNameConflicts();
var KIVA = {};
KIVA['pids'] = PIDS;
KIVA['partners'] = PARTNERS;
KIVA['countries'] = COUNTRIES;
KIVA['sectors'] = SECTORS;
KIVA['amounts'] = AMOUNTS;
KIVA['months'] = MONTHS;
KIVA['timeline'] = loans_timeline();
KIVA['loans'] = make_hierarchy();
console.log("var KIVA=%j;", KIVA);
