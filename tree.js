/*
 * Load the tree data from the server
 */
var server   = "/cgi-bin/server.py?"
  , treename = ''
  , graph    = new Graph()
  , nodes    = {}
  , latestId = -1
  , refreshInterval
  ;

var addNode = function(n) {
    // this must be the latest node
    latestId = n.id;
    // the colour index for the palette
    var c_idx = Math.floor((1.0-n.error)*(NUM_COLOURS-1));
    //console.log(n.error);
    nodes[n.id] = graph.newNode({ label:     n.id
                                , parent:    n.parent
                                , sequence:  n.sequence
                                , error:     n.error
                                , ip:        n.ip
                                , radius:    n.id==0 ? 25 : 30
                                , lineWidth: n.id==0 ? 15 : 0.1
                                , stroke:    edge_colour
                                , fill:      n.id==0 ?
                                     'black' : palettehex[c_idx]
                                , isnew:     true
                                , islatest:  false
                                });
    // Add the edge from the parent node
    if (n.parent != "null") {
        graph.newEdge(nodes[n.parent], nodes[n.id],
                { colour:       edge_colour
                , directional:  false
                , weight:       2.0
                });
    }
}

var refreshTree = function() {
    d3.text(server+"tree", function (datasetText) {
        // the first line is the tree name
        var datasetText = datasetText.replace(/(.*)\n/, function(a) {
            treename = a;
            return "";
        });
        var treeInfo = d3.csv.parse(datasetText);
        // Add the nodes if the don't exist already
        treeInfo.forEach( function(n) {
            if (nodes[n.id]) {
                nodes[n.id].data.isnew    = false;
                nodes[n.id].data.islatest = false;
            }
            else {
                addNode(n);
            }
        });
        if (latestId > 0) {
            nodes[latestId].data.islatest = true;
        }
    });
};

jQuery(function(){
    var ctx = document.getElementById('tree_viz').getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    var springy = jQuery('#tree_viz').springy({
        graph: graph
    });
});

// start refreshing the tree
refreshTree();
// TODO: put this back to refresh the tree
refreshInterval = setInterval("refreshTree()", 5000);
