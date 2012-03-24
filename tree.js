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
    nodes[n.id] = graph.newNode({ label:        n.id
                                , parent:       n.parent
                                , sequence:     n.sequence
                                , error:        n.error
                                , ip:           n.ip
                                , radius:       30
                                , lineWidth:    3
                                , stroke:       "#000000"
                                , fill:         "#8ED6FF"
                                });
    // Add the edge from the parent node
    if (n.parent != "null") {
        graph.newEdge(nodes[n.parent], nodes[n.id],
                { colour:       '#000000'
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
