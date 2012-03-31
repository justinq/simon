var bg_colour   = "#000000",
    edge_colour = "#ffffff",
    // simon buttons 1,2,3,4
    btn_palletef   = [ [0.0, 1.0, 1.0, 1.0]
                     , [1.0, 1.0, 0.0, 1.0]
                     , [0.0, 1.0, 0.0, 1.0]
                     , [1.0, 0.0, 0.0, 1.0]
                     ],
    buttons = ["centre", "blue", "yellow" , "green" , "red"],
    btn_colours = ["#000000", "#00ffff", "#ffff00", "#00ff00", "#ff0000"];

var rgb2hex = function(r, g, b) {
    var decColour = r + 256 * g + 65536 * b;
    return decColour.toString(16);
}
