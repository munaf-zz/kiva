// prep_data.js
// Takes raw Kiva JSON and preps it for use by the visualization.
// 
// Inputs:
//  LOANS_RAW.js produced by ./kiva-get.py
// Dependencies:  
//  $ brew install node
//  $ curl http://npmjs.org/install.sh | sh
//  $ npm install underscore
// Usage: 
//  $ node prep_data.js > kiva-data.js 
// Outputs:
//  loans_sorted:  Array of loans sorted by loan ID
//  loans_partner: Object containing loans indexed by lending partner ID.
//  partners:      Object of lending partners indexed by lending partner ID.

var L  = require('./LOANS_RAW').LOANS;
var us = require('underscore')._; // node REPL screws up using _ as var name
var loans = us(L).flatten();

// Loans sorted by ID.
var loans_sorted = us(loans).sortBy(function(obj) { return obj['id']; });
//console.log('var loans_sorted=%j;', loans_sorted);

// Loans by partner.
var loans_partner = us(loans_sorted).chain()
  .pluck('partner_id')
  .zip(us(loans_sorted).pluck('id'))
  .groupBy(function(a) { return a[0]; })
  .map(function(arr, key, list) {
    var out = {};
    var arr_flat = us(arr).chain()
      .flatten().without(parseInt(key)).value();
    out[key] = arr_flat;
    return out;
  })
  .reduce(function(memo, obj) { return us.extend(memo, obj); }, {})
  .value();
console.log('var loans_partner=%j;', loans_partner);
// Loans by sector.

// Loans grouped by dollar range.

// Loans grouped by tag.

// console.log('var loans_partner = '); 
//console.log(loans_partner);
// console.log(';');
