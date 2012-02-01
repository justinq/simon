/*
 * The Simon Game
 */

var opacityOff = 0.5
  , opacityOn  = 1.0
  ;

var server = "/cgi-bin/server.py?"
var State = { "ready" : 0
            , "get"   : 1
            , "play"  : 2
            , "input" : 3
            , "put"   : 4
            , "score" : 5
            };
var StateText = [ "Ready?<br/>Click to begin"
                , "Picking<br/>from tree..."
                , "Watch & Listen"
                , "Play back<br/>then click<br/>here"
                , "Adding<br/>to tree..."
                , "SCORE<br/>Click for next"
                ];
var Buttons = [ "centre" , "blue" , "yellow" , "green" , "red" ];

var currentState = State.ready;
var currentSequence;

var setState = function(state) {
    currentState = state;
    var msg = StateText[state];
    // if it's the scoring state, add the score
    if (state == State.score) {
        msg = msg.replace("SCORE", currentSequence.score==100 ? "Perfect!" : currentSequence.score+"%");
    }
    d3.select("#btn_centre_text").html( msg );
}

/*
 * Get the next sequence from the tree
 */
var getSequence = function() {
    d3.text(server+"get", function (datasetText) {
        //var info = d3.csv.parse(datasetText);
        var data = datasetText.split('\n');
        if (data.length >= 3) {
            currentSequence = { "parent"   : data[0]
                              , "sequence" : data[1]
                              , "accuracy" : data[2]
                              , "input"    : ""
                              , "score"    : 0
                              };
            setState(State.play);
            playSequence(currentSequence.sequence);
        }
    });
}

/*
 * Play the sequence
 */
var highlightButton = function(i, on) {
    d3.select("#btn_"+Buttons[i])
        .style("fill-opacity", on ? opacityOn : opacityOff);
}

var playNote = function(i) {
    document.getElementById(Buttons[i]+"-tone").play();
}

var playSequence = function(s) {
    if (s.length > 0) {
        // play first first note
        var note = s[0];
        highlightButton(note, true);
        playNote(note);
        setTimeout('highlightButton('+note+', false)', 500);
        // play the remaining notes
        setTimeout('playSequence("'+s.substring(1)+'")', 750);
    }
    else {
        setState(State.input);
    }
}

/*
 * Add the sequence to the tree
 */
var putSequence = function(s) {
    d3.text(server+"put,"+currentSequence.parent+","
            +currentSequence.sequence+","+currentSequence.input,
        function (datasetText) {
            var data = datasetText.split('\n');
            if (data.length >= 1) {
                // Error is returned, score = 1 - error
                currentSequence.score = (1.0 - parseFloat(data[0])) * 100;
            }
            setState(State.score);
        });
}

var mainBtnDown = function(element) {
}

var mainBtnUp = function(element) {
    switch (currentState) {
        case State.ready:
        case State.score:
            // Pick a new sequence
            setState(State.get);
            getSequence();
            break;
        case State.get:
        case State.play:
        case State.put:
            break;
        case State.input:
            // Add the inputted sequence
            setState(State.put);
            putSequence();
            break;
        default:
            break;
    }
}

var btnDown = function(element, d, i) {
    if (currentState == State.input) {
        highlightButton(i, true);
        currentSequence.input += i;
        playNote(i);
    }
};

var btnUp = function(element, d, i) {
    highlightButton(i, false);
};

d3.xml("images/game.svg", "image/svg+xml", function(xml) {
    var importedNode = document.importNode(xml.documentElement, true);
    d3.select("#game_viz").node().appendChild(importedNode);

    // Bind data and functions to buttons
    d3.select("#simon").selectAll(".btn")
      .data(Buttons)
      .style("fill-opacity", opacityOff)
      .on(is_touch_device ? "touchstart" : "mousedown", function(d, i) {
          i==0 ? mainBtnDown(this) : btnDown(this, d, i);
      })
      .on(is_touch_device ? "touchend" : "mouseup", function(d, i) {
          i==0 ? mainBtnUp(this) : btnUp(this, d, i);
      });

    d3.select("#btn_centre_label")
      .on(is_touch_device ? "touchstart" : "mousedown", function() {
          mainBtnDown(this);
      })
      .on(is_touch_device ? "touchend" : "mouseup", function() {
          mainBtnUp(this);
      });

    // set to ready state
    setState(State.ready);
});

