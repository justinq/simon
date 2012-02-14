/*
 * Load the tree data from the server
 */
var server  = "/cgi-bin/server.py?"
  , graph   = new Graph()
  , nodes   = {}
  ;

d3.text(server+"tree", function (datasetText) {
    // the first line is the tree name
    var treename,
        datasetText = datasetText.replace(/(.*)\n/, function(a) {
        treename = a;
        return "";
    });
    console.log(datasetText);
    var treeInfo = d3.csv.parse(datasetText);
    treeInfo.forEach( function(i) {
        // create the node
        nodes[i.id] = graph.newNode({ label:i.id
                                  , parent:i.parent
                                  , sequence:i.sequence
                                  , error:i.error
                                  , ip:i.ip
                                  });
        // Add the edge from the parent node
        if (i.parent != "null") {
            graph.newEdge(nodes[i.parent], nodes[i.id], {color: '#000000'});
        }
    });
});

jQuery(function(){
    var springy = jQuery('#tree_viz').springy({
        graph: graph
    });
});

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
