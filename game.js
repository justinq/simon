var opacityOff = 0.5
  , opacityOn  = 1.0
  ;

d3.xml("game.svg", "image/svg+xml", function(xml) {
    var importedNode = document.importNode(xml.documentElement, true);
    d3.select("#viz").node().appendChild(importedNode);

    var buttons = [ "centre"
                  , "blue"
                  , "yellow"
                  , "green"
                  , "red"
                  ];

    // Bind data and functions to buttons
    d3.select("#simon").selectAll(".btn")
      .data(buttons)
      .style("fill-opacity", opacityOff)
      .on("mousedown", function(d, i) {
          d3.select(this).style("fill-opacity", opacityOn);
      })
      .on("mouseup", function(d, i) {
          d3.select(this).style("fill-opacity", opacityOff);
      });

});

