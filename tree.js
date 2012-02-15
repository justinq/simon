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
    nodes[n.id] = graph.newNode({ label:n.id
                                , parent:n.parent
                                , sequence:n.sequence
                                , error:n.error
                                , ip:n.ip
                                });
    // Add the edge from the parent node
    if (n.parent != "null") {
        graph.newEdge(nodes[n.parent], nodes[n.id], {color: '#000000'});
    }
}

var refreshTree = function() {
    console.log("refreshTree");
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
refreshInterval = setInterval("refreshTree()", 5000);


/*
// Assign handlers immediately after making the request,
// and remember the jqxhr object for this request
var jqxhr = $.get('tree.csv')
    .success( function(data) {
        console.log(data);
        alert("success");
    })
    .error( function(e) {
        console.log(e);
        alert(e.statusText);
    })
    .complete( function(data) {
        console.log("complete");
    });
*/
