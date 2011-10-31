var L  = require('./LOANS_RAW').LOANS;
var us = require('underscore')._;
var loans = us(L).flatten();

var loans_partner = us(loans).chain()
  .pluck('partner_id')                   // array of partner IDs
  .zip(us(loans).pluck('id'))            // array of arrays [ [pid, loan], [pid, loan], ... ]
  .groupBy(function(a) { return a[0]; }) // object. {'pid': [ [pid, loan], [pid, loan] ... ], 'pid': ... }
  .map(function(arr, key, list) {
    var out = {};
    var arr_flat = us(arr).chain().flatten().without(parseInt(key)).value();
    out[key] = arr_flat;
    return out;
  })
  .value();

console.log('var loans_partner = '); 
console.log(loans_partner);
console.log(';');
