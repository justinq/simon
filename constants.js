var edge_colour = "#ffffff",
    NUM_COLOURS = 12,
    palette =       [ [41,    10,  216,  255]
                    , [38,    77,  255,  255]
                    , [63,   160,  255,  255]
                    , [114,  217,  255,  255]
                    , [170,  247,  255,  255]
                    , [224,  255,  255,  255]
                    , [255,  255,  191,  255]
                    , [255,  224,  153,  255]
                    , [255,  173,  114,  255]
                    , [247,  109,   94,  255]
                    , [216,   38,   50,  255]
                    , [165,    0,   33,  255]
                    ],
    palettef =  [ [0.16, 0.04, 0.85, 1.00]
                    , [0.15, 0.30, 1.00, 1.00]
                    , [0.25, 0.63, 1.00, 1.00]
                    , [0.45, 0.85, 1.00, 1.00]
                    , [0.67, 0.97, 1.00, 1.00]
                    , [0.88, 1.00, 1.00, 1.00]
                    , [1.00, 1.00, 0.75, 1.00]
                    , [1.00, 0.88, 0.60, 1.00]
                    , [1.00, 0.68, 0.45, 1.00]
                    , [0.97, 0.43, 0.37, 1.00]
                    , [0.85, 0.15, 0.20, 1.00]
                    , [0.65, 0.00, 0.13, 1.00]
                    ],
    palettehex = [ "#d80a29", "#ff4d26", "#ffa03f", "#ffd972"
                 , "#fff7aa", "#ffffe0", "#bfffff", "#99e0ff"
                 , "#72adff", "#5e6df7", "#3226d8", "#2100a5"
                 ]
    // simon buttons 1,2,3,4
    btn_palletef = [ [0.0, 1.0, 1.0, 1.0]
                   , [1.0, 1.0, 0.0, 1.0]
                   , [0.0, 1.0, 0.0, 1.0]
                   , [1.0, 0.0, 0.0, 1.0]
                   ];

var rgb2hex = function(r, g, b) {
    var decColour = r + 256 * g + 65536 * b;
    return decColour.toString(16);
}
