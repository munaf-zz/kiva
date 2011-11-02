var MAPELEMENT;
var CURDATA;

function sumArray(arr) {
  return _(arr).reduce(function(memo, num) { return (memo+num); }, 0);
}

function successRate(arr) {
  return sumArray(arr) / arr.length;
}

function equalCountry(country, key) {
  return KIVA['countries'][parseInt(key)] == country;
}

function filterByDate(start, end, data) {
  var months = _(KIVA['months']).clone();
  months = months.slice(
    _(months).indexOf(start), _(months).indexOf(end)+1
  );
  CURDATA = {};
  _(months).each(function(month) { 
    CURDATA[month] = data[month]; 
  });
  MAPELEMENT.reshow();
}

function successByCountry(country, data) {
  var success = [];
  _(data).each(function(date_filt, date_key, date_list) {
    _(date_filt).each(function(pid_filt, pid_key, pid_list) {
      _(pid_filt).each(function(loc_filt, loc_key, loc_list) {
        if (equalCountry(country, loc_key)) {
          _(loc_filt).each(function(sect_filt, sect_key, sect_list) {
            _(sect_filt).each(function(obj_filt, obj_key, obj_list) {
              success.push(obj_filt['s']);
            });
          });
        }
      });
    });
  });
  return successRate(success);
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

map.add(MAPELEMENT = po.geoJson()
  .url("http://munaf.github.com/kiva/data/world.json")
  .tile(false)
  .zoom(3)
  .on("load", initMap)
  .on("show", renderMap));

  console.log(MAPELEMENT);
map.add(po.compass()
  .pan("none"));

map.container().setAttribute("class", "YlOrRd");

function initMap(e) {
  CURDATA = KIVA['loans'];
  MAPELEMENT.reshow();
}

function renderMap(e) {
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i],
        n = feature.data.properties.name,
        v = successByCountry(n, CURDATA);
    n$(feature.element)
      .attr("class", isNaN(v) ? null : "q" + ~~(v * 9) + "-" + 9)
      .add("svg:title")
        .text(n + (isNaN(v) ? "" : ":  " + formatPercent(v)));
  } 
}

function formatPercent(p) {
  return (p * 100).toPrecision(Math.min(2, 2 - Math.log(p) / Math.LN2)) + "%";
}


