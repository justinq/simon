/*
 * Load the tree data from the server
 */
var server   = "/cgi-bin/server.py?"
  , treename = ''
  , graph    = new Graph()
  , nodes    = {}
  , refreshInterval
  , numColours  = 11
  , colourScale = d3.scale.ordinal()
                    .domain(d3.range(0, numColours))
                    .range(colorbrewer.RdYlBu[numColours])
  , nodeQueue = new Array()
  ;

var addNode = function(n) {
    // the colour index for the palette
    var c_idx = Math.floor((1.0-n.error)*(numColours-1));
    nodes[n.id] = graph.newNode({ label:     n.id
                                , parent:    n.parent
                                , sequence:  n.sequence
                                , error:     n.error
                                , ip:        n.ip
                                , radius:    n.id==0 ? 15 : 20
                                , lineWidth: n.id==0 ? 10 : 0.1
                                , stroke:    edge_colour
                                , fill:      n.id==0 ?
                                   'black' : colourScale(c_idx).toString()
                                , isnew:     true
                                , islatest:  true
                                });
    // Add the edge from the parent node
    if (n.parent != "null") {
        graph.newEdge(nodes[n.parent], nodes[n.id],
                { colour:       edge_colour
                , directional:  false
                , weight:       1.0
                });
    }

    return nodes[n.id];
}

var addNodeFromQueue = function() {
    // remove the latest flag from all the old nodes
    for (var n in nodes) { nodes[n].data.islatest = false; }
    // add the first node in queue, set timeout to add the next
    addNode( nodeQueue.shift() );
    if( nodeQueue.length > 0) { setTimeout(addNodeFromQueue, 500); }
}

var refreshTree = function() {
    // only update if there are no nodes in the queue
    if( nodeQueue.length > 1) { return; }

    d3.text(server+"tree", function (datasetText) {
        // the first line is the tree name
        var datasetText = datasetText.replace(/(.*)\n/, function(a) {
            treename = a;
            return "";
        });
        var treeInfo = d3.csv.parse(datasetText);
        // Add the nodes if it doesn't exist already
        treeInfo.forEach( function(n) {
            if (nodes[n.id]) {
                nodes[n.id].data.isnew    = false;
            }
            else {
                nodeQueue.push(n);
            }
        });
        // start adding the nodes from the queue
        if (nodeQueue.length > 0) { addNodeFromQueue(); }
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
