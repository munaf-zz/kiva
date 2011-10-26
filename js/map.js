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

map.add(po.geoJson()
  .url("../data/world.json")
  .tile(false)
  .zoom(3));

map.add(po.compass()
  .pan("none"));

map.container().setAttribute("class", "YlOrRd");
