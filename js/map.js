function sumArray(arr) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) sum+=arr[i];
  return sum;
}

function successRate(arr, country) {
//  if (!arr.length) console.log(country);
//  return sumArray(arr) / arr.length;
  return sumArray(arr) / (arr.length ? arr.length : 1);
}

function equalCountry(country, key) {
  return COUNTRIES[parseInt(key)] == country;
}

function filterByDate(start, end, possible) {
  var months = _(MONTHS).clone();
  months = months.slice(
    _(months).indexOf(start), _(months).indexOf(end)+1
  );
  delete CURRENT;
  CURRENT = {};
  _(months).each(function(month) { 
    if (month >= start || month <= end)
      CURRENT[month] = _.clone(possible[month]);
  });
  MAP.reshow();
}

function filterByPartner(pid) {
  var loans_cln = _.clone(KIVA['loans']);
  if (pid == 0) {
    POSSIBLE = _.clone(KIVA['loans']);
  }
  else {
    _(loans_cln).each(function(month_obj, month_key, month_list) {
      for (key in month_obj)
        if (key != pid) delete month_obj[key];
    });
    POSSIBLE = _(loans_cln).clone();
  }
  filterByDate(MONTHS[TRANGE[0]], MONTHS[TRANGE[1]], POSSIBLE);
}

function successByCountry(country, data) {
  var success = [];
  var rate = 0;
  _(data).each(function(date_filt, date_key, date_list) {
    _(date_filt).each(function(pid_filt, pid_key, pid_list) {
      _(pid_filt).each(function(loc_filt, loc_key, loc_list) {
        if (equalCountry(country, loc_key)) {
          _(loc_filt).each(function(sect_filt, sect_key, sect_list) {
            _(sect_filt).each(function(obj_filt, obj_key, obj_list) {
              success.push(parseInt(obj_filt['s']));
            });
          });
        }
      });
    });
  });
  rate = successRate(success, country);
  return rate;
}

var po = org.polymaps;

var map = po.map()
  .container(document.getElementById("map").appendChild(po.svg("svg")))
  .center({lat: 40, lon: 0})
  .zoomRange([1, 5])
  .zoom(2)
  .add(po.interact());

map.add(po.image()
  .url(po.url("http://{S}tile.cloudmade.com"
    + "/53a8593b4c2c403bae8d88f842dbb3b3" // http://cloudmade.com/register
    + "/998/256/{Z}/{X}/{Y}.png")
  .hosts(["a.", "b.", "c.", ""])));

map.add(MAP = po.geoJson()
  .url("../data/world.json")
  .tile(false)
  .zoom(3)
  .on("load", initMap)
  .on("show", renderMap));

map.add(po.compass()
  .pan("none"));

map.container().setAttribute("class", "YlOrRd");

function initMap(e) {
  MAP.reshow();
}

function renderMap(e) {
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i],
        n = feature.data.properties.name;
    if (_(COUNTRIES).find(function(c) {return c==n;})) {
      v = successByCountry(n, CURRENT);
        if (isNaN(v)) console.log("nan found");
      n$(feature.element)
        .attr("class", isNaN(v) ? null : "q" + ~~(v * 9) + "-" + 9)
        .add("svg:title")
          .text(n + (isNaN(v) ? "" : ":  " + formatPercent(v)));
    }
  } 
}

function formatPercent(p) {
  return (p * 100).toPrecision(Math.min(2, 2 - Math.log(p) / Math.LN2)) + "%";
}
