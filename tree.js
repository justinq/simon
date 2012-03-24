/*
 * Load the tree data from the server
 */
var server   = "/cgi-bin/server.py?"
  , treename = ''
  , graph    = new Graph()
  , nodes    = {}
  , refreshInterval
  ;

var addNode = function(n) {
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
            if (!nodes[n.id]) {
                addNode(n);
            }
        });
    });
};

jQuery(function(){
    var springy = jQuery('#tree_viz').springy({
        graph: graph
    });
});
// start refreshing the tree
refreshTree();
// TODO: put this back to refresh the tree
//refreshInterval = setInterval("refreshTree()", 5000);
