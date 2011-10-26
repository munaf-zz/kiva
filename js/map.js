var po = org.polymaps;

var map = po.map()
  .container(document.getElementById("map").appendChild(po.svg("svg")))
  .center({lat: 40, lon: 0})
  .zoomRange([1, 5])
  .zoom(2)
  .add(po.interact());

map.add(po.image()
  .url("http://s3.amazonaws.com/com.modestmaps.bluemarble/{Z}-r{Y}-c{X}.jpg"));

map.add(po.geoJson()
  .url("../data/world.json")
  .tile(false)
  .zoom(3));

map.add(po.compass()
  .pan("none"));

map.container().setAttribute("class", "YlOrRd");
