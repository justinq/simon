/*
 * Load the tree data from the server
 */
var server = "/cgi-bin/server.py?"
var graph = new Graph();

d3.text(server+"tree", function (datasetText) {
    var treeInfo = d3.csv.parse(datasetText);
    treeInfo.forEach( function(i) {
        //console.log(i);
        var n = graph.newNode({label:i.name, sequence:i.sequence});
        //console.log(n.id);
        if (i.parent != "null") {
            // TODO: get the parent node
            //graph.newEdge(n, n_parent, {color: '#00A0B0'});
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
