
var opacityOff = 0.5
  , opacityOn  = 1.0
  ;

var btnDown = function(element, d, i) {
    document.getElementById(d+"-tone").play();
    d3.select(element).style("fill-opacity", opacityOn);
};
var btnUp = function(element, d, i) {
    d3.select(element).style("fill-opacity", opacityOff);
};

d3.xml("images/game.svg", "image/svg+xml", function(xml) {
    var importedNode = document.importNode(xml.documentElement, true);
    d3.select("#game_viz").node().appendChild(importedNode);

    var buttons = [ "centre" , "blue" , "yellow" , "green" , "red" ];

    // Bind data and functions to buttons
    d3.select("#simon").selectAll(".btn")
      .data(buttons)
      .style("fill-opacity", opacityOff)
      .on(is_touch_device ? "touchstart" : "mousedown", function(d, i) {
          btnDown(this, d, i);
      })
      .on(is_touch_device ? "touchend" : "mouseup", function(d, i) {
          btnUp(this, d, i);
      });
});

d3.text("/cgi-bin/server.py?get", function (datasetText) {
    //var info = d3.csv.parse(datasetText);
});
