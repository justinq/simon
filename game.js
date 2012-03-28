/*
 * The Simon Game
 */

var idleTime    = 60000
  , idleTimeout = null
  , opacityOff  = 0.5
  , opacityOn   = 1.0
  , server      = "/cgi-bin/server.py?"
  , State       = { "ready" : 0
                  , "get"   : 1
                  , "play"  : 2
                  , "input" : 3
                  , "put"   : 4
                  , "score" : 5
                  }
  , StateText   = [ "<p><span style='font-size:x-large'>Ready?</span></p><p>Click to begin</p>"
                  , "<p>Picking<br/>from tree...</p>"
                  , "<p>Watch<br/>&<br/>Listen</p>"
                  , "<p>Play back<br/>then click<br/>here</p>"
                  , "<p>Adding<br/>to tree...</p>"
                  , "<p><span style='font-size:xx-large'>SCORE</span><br/>Click for next</p>"
                  ]
  , currentState = State.ready
  , currentSequence
  , progressArc, progressBar
  , loaded = true
  ;

/*
 * Set the current State
 */
var setState = function(state) {
    currentState = state;
    var msg = StateText[state];
    // if it's the scoring state, add the score
    if (state == State.score) {
        msg = msg.replace("SCORE", currentSequence.score==100 ? "Perfect!" : currentSequence.score+"%");
    }
    // start the idle timeout for input or score phase
    if (state == State.input || state == State.score) startIdleTimeout();
    else clearIdleTimeout();

    d3.select("#btn_centre_text").html( msg );
}

var resetState = function() {
    setState(State.ready);
}

/*
 * Get the next sequence from the tree
 */
var checkForNewSequence = function() {
    if (currentSequence!=null) {
        setState(State.play);
        playSequence(currentSequence.sequence);
        return true;    
    }
}

var getSequence = function() {
    // start the progress indicator
    currentSequence = null;
    progressTimer(checkForNewSequence);
    d3.text(server+"get", function (datasetText) {
        var data = datasetText.split('\n');
        if (data.length >= 3) {
            currentSequence = { "parent"   : data[0]
                              , "sequence" : data[1]
                              , "accuracy" : data[2]
                              , "input"    : ""
                              , "score"    : null
                              };
        }
    });
}

/*
 * Play the sequence
 */
var highlightButton = function(i, on) {
    d3.select("#btn_"+buttons[i])
        .style("fill-opacity", on ? opacityOn : opacityOff);
}

var playNote = function(i) {
    document.getElementById(buttons[i]+"-tone").play();
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
var checkForScore = function() {
    if (currentSequence.score!=null) {
        setState(State.score);
        return true;    
    }
}

var putSequence = function(s) {
    // if nothing has been entered, just report 0 score
    if (currentSequence.input.length<1) {
        currentSequence.score = 0;
        setState(State.score);
    }
    // Add sequence to tree and report score
    else {
        progressTimer(checkForScore);
        d3.text(server+"put,"+currentSequence.parent+","
                +currentSequence.sequence+","+currentSequence.input,
            function (datasetText) {
                var data = datasetText.split('\n');
                if (data.length >= 1) {
                    // Error is returned, score = 1 - error
                    currentSequence.score = Math.round((1.0-parseFloat(data[0]))*100);
                }
            });
    }
}

var mainBtnDown = function(element) {
    clearIdleTimeout();
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
        clearIdleTimeout();
    }
};

var btnUp = function(element, d, i) {
    if (currentState == State.input) {
        highlightButton(i, false);
        startIdleTimeout();
    }
};

d3.xml("images/game.svg", "image/svg+xml", function(xml) {
    var viz = d3.select("#game_viz");
    var importedNode = document.importNode(xml.documentElement, true);
    var simonSVG = d3.select( viz.node().appendChild(importedNode) );
    var g = d3.select("#simon");

    // Bind data and functions to buttons
    d3.select("#simon").selectAll(".btn")
      .data(buttons)
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

    /*
     * Create the loading indicator / progress bar
     */
    //debugger
    var r = 80;
    progressArc = d3.svg.arc()
        .innerRadius(r * .9).outerRadius(r)
        .startAngle(function(d) { return d>0.5 ? (d-0.5)*4*Math.PI : 0; })
        .endAngle(function(d)   { return d>0.5 ? 2*Math.PI : d*4*Math.PI; });
    progressBar = g.append("svg:path")
        .data([0.0])
        .attr("id", "progressBar")
        .attr("d", progressArc)
        .attr("transform", "translate(383,670)")
        .attr("fill", "white");

    // set to ready state
    setState(State.ready);
});

/*
 * The progress timer - stopFunction should return true if finished
 */
var progressTimer = function(stopFunction, params) {
    var loadProgress = 0.0;
    d3.timer(function() {
        loadProgress += 0.01;
        progressBar.data([loadProgress]).attr("d", progressArc);
        if (loadProgress>1.0) {
            loadProgress = 0.0;
            return stopFunction(params);
        }
    });
}

// reset the game after a timeout
var clearIdleTimeout = function() {
    if (idleTimeout) {
        clearTimeout(idleTimeout);
    }
    idleTimeout = null;
}

var startIdleTimeout = function() {
    clearIdleTimeout();
    idleTimeout = setTimeout(resetState, idleTime);
}

