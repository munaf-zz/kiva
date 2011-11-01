// Draws a bar chart depicting loans per month throughout entire dataset.
// Provides context (time period, # of loans) to map coloring.
// User can highlight a time period to select a specific context.

 var t = 1297110663, // start time (seconds since epoch)
     v = 70, // start value (subscribers)
     data = d3.range(2500).map(next); // starting dataset
 
 function next() {
   return {
     time: ++t,
     value: v = ~~Math.max(10, Math.min(90, v + 10 * (Math.random() - .5)))
   };
 }

var vizWidth  = 700; 
var barWidth  = vizWidth / data.length;
var barHeight = 75;

// Scaling functions for context bar chart.
var x = d3.scale.linear()
  .domain([0, 1])
  .range([0, barWidth]);
var y = d3.scale.linear()
  .domain([0, 100])
  .range([0, barHeight]);

// Create context bar chart.
var context = d3.select("#context")
  .append("svg:svg")
    .attr("class", "context-area")
    .attr("id", "context-chart")
    .attr("width", barWidth * data.length - 1)
    .attr("height", barHeight)
//    .attr("pointer-events", "all")
    .on("mousedown", startTimeSelect);
    //.on("mousemove", scaleTimeSelect)
    //.on("mouseup", stopTimeSelect);

// Add bars to bar chart.
context.selectAll("rect")
  .data(data)
  .enter().append("svg:rect")
    .attr("fill", "cornflowerblue")
    .attr("x", function(d, i) { return x(i) - 0.5; })
    .attr("y", function(d) { return barHeight - y(d.value) - 0.5; })
    .attr("width", barWidth)
    .attr("height", function(d) { return y(d.value); });

// Add Y-Axis on bottom.
context.append("svg:line")
  .attr("x1", 0)
  .attr("x2", barWidth * data.length)
  .attr("y1", barHeight - 0.5)
  .attr("y2", barHeight - 0.5)
  .attr("stroke", "#000");

// Logic to handle time window selection.
var timefilter, 
    t0, 
    t1, 
    count, 
    selStart,
    pointerOffset; 

// Initializes context selection overlay.
function startTimeSelect() {
  console.log("starting time selector...");
  if (timefilter) timefilter.remove();
  t0 = d3.svg.mouse(this);
  timefilter = context 
    .append("svg:rect")
      .style("cursor", "move")
      .style("fill", "pink")
      .style("fill-opacity", .5)
    .on("mousedown", grabTimeWindow);
  
  context.on("mousemove", scaleTimeSelect);
  d3.event.preventDefault(); 
}

// Scales context selection overlay.
function scaleTimeSelect() {
  if (!timefilter) return;
  context.on("mouseup", stopTimeSelect);
  t1 = d3.svg.mouse(this);

  var minx = Math.min(t0[0], t1[0]),
      maxx = Math.max(t0[0], t1[0]);
  selStart = minx - 0.5;
  timefilter 
    .attr("x", selStart)
    .attr("y", 5)
    .attr("width", maxx - minx + 1)
    .attr("height", barHeight);
}

// Stops selecting time window.
function stopTimeSelect() {
  context.on("mousemove", null);
  context.on("mouseup", null);
}

function grabTimeWindow() {
  if (!timefilter) return;
  pointerOffset = d3.svg.mouse(this)[0] - selStart;
  context.on("mousedown", null);
  context.on("mouseup", null);
  timefilter.on("mousemove", moveTimeWindow);
}

function moveTimeWindow() {
  if (!timefilter) return;
  timefilter.on("mouseup", releaseTimeWindow);
  timefilter.on("mouseout", releaseTimeWindow);
  var x = d3.svg.mouse(this)[0] - pointerOffset;
  timefilter.attr("x", Math.max(0, Math.min(x, vizWidth-timefilter.attr("width"))));
}

function releaseTimeWindow() {
  selStart = timefilter.attr("x");
  timefilter.on("mouseup", null);
  timefilter.on("mousemove", null);
  timefilter.on("mouseout", null);
  context.on("mousedown", startTimeSelect);
  context.on("mouseup", stopTimeSelect);
}
