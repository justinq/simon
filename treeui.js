/**
Copyright (c) 2010 Dennis Hotson

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

// Renderer handles the layout rendering loop
function Renderer(interval, layout, clear, drawEdge, drawNode, drawOverlay) {
	this.interval = interval;
	this.layout = layout;
	this.clear = clear;
	this.drawEdge = drawEdge;
	this.drawNode = drawNode;
	this.drawOverlay = drawOverlay;

	this.layout.graph.addGraphListener(this);
}

Renderer.prototype.graphChanged = function(e) {
	this.start();
};

Renderer.prototype.start = function() {
	var t = this;
	this.layout.start(50, function render() {
		t.clear();

		t.layout.eachEdge(function(edge, spring) {
			t.drawEdge(edge, spring.point1.p, spring.point2.p);
		});

		t.layout.eachNode(function(node, point) {
			t.drawNode(node, point.p);
		});

        t.drawOverlay();
	});
};

(function() {

jQuery.fn.springy = function(params) {
	var graph = this.graph = params.graph || new Graph();

	var stiffness = params.stiffness || 400.0;
	var repulsion = params.repulsion || 400.0;
	var damping = params.damping || 0.5;

	var canvas = this[0];
	var ctx = canvas.getContext("2d");

	var layout = this.layout = new Layout.ForceDirected(graph, stiffness, repulsion, damping);

	// calculate bounding box of graph layout.. with ease-in
	var currentBB = layout.getBoundingBox();
	var targetBB = {bottomleft: new Vector(-2, -2), topright: new Vector(2, 2)};

    var PIx2 = 2*Math.PI;

	// auto adjusting bounding box
	Layout.requestAnimationFrame(function adjust() {
		targetBB = layout.getBoundingBox();
		// current gets 20% closer to target every iteration
		currentBB = {
			bottomleft: currentBB.bottomleft.add( targetBB.bottomleft.subtract(currentBB.bottomleft)
				.divide(10)),
			topright: currentBB.topright.add( targetBB.topright.subtract(currentBB.topright)
				.divide(10))
		};

		Layout.requestAnimationFrame(adjust);
	});

	// convert to/from screen coordinates
	toScreen = function(p) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var sx = p.subtract(currentBB.bottomleft).divide(size.x).x * canvas.width;
		var sy = p.subtract(currentBB.bottomleft).divide(size.y).y * canvas.height;
		return new Vector(sx, sy);
	};

	fromScreen = function(s) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var px = (s.x / canvas.width) * size.x + currentBB.bottomleft.x;
		var py = (s.y / canvas.height) * size.y + currentBB.bottomleft.y;
		return new Vector(px, py);
	};

	// half-arsed drag and drop
	var selected = null;
	var nearest = null;
	var dragged = null;

    // keep track of the last added node
    var latest = null;

	var mousedown = function(p) {
		jQuery('.actions').hide();
		selected = nearest = dragged = layout.nearest(p);

		if (selected.node !== null) {
			// Part of the same bug mentioned later. Store the previous mass
			// before upscaling it for dragging.
			dragged.point.m = 10000.0;
		}

		renderer.start();
	};

	var mousemove = function(p) {
		if (dragged !== null && dragged.node !== null) {
		    nearest = layout.nearest(p);

            // change the selected to nearest and redraw if necessary
            if (selected.node.id != nearest.node.id) { renderer.start(); }
		    selected = dragged = nearest;
            //don't move the node
			//dragged.point.p.x = p.x;
			//dragged.point.p.y = p.y;
		}
	}

	var mouseup = function() {
		// Bug! Node's mass isn't reset on mouseup. Nodes which have been
		// dragged don't repulse very well. Store the initial mass in mousedown
		// and then restore it here.
		dragged = null;
        selected = null; // remove this to keep selected

		renderer.start();
	}

    if (is_touch_device) {
	    document.addEventListener('touchstart',function(e) {
		    var pos = jQuery(this).offset();
		    var p = fromScreen({x: e.touches[0].pageX, y: e.touches[0].pageY});
            mousedown(p)
        });
	    document.addEventListener('touchmove',function(e) {
		    var pos = jQuery(this).offset();
		    var p = fromScreen({x: e.touches[0].pageX, y: e.touches[0].pageY});
            mousemove(p)
        });
	    document.addEventListener('touchend',function(e) {
            mouseup();
        });
    }
    else {
	    jQuery(canvas).mousedown(function(e) {
		    var pos = jQuery(this).offset();
		    var p = fromScreen({x: e.pageX - pos.left, y: e.pageY - pos.top});
            mousedown(p)
        });
	    jQuery(canvas).mousemove(function(e) {
		    var pos = jQuery(this).offset();
		    var p = fromScreen({x: e.pageX - pos.left, y: e.pageY - pos.top});
            mousemove(p)
        });
	    jQuery(window).bind('mouseup',function(e) {
            mouseup();
        });
    }

	var renderer = new Renderer(1, layout,
		function clear() {
			ctx.clearRect(0,0,canvas.width,canvas.height);
		},
		function drawEdge(edge, p1, p2) {
			var x1 = toScreen(p1).x;
			var y1 = toScreen(p1).y;
			var x2 = toScreen(p2).x;
			var y2 = toScreen(p2).y;

			var direction = new Vector(x2-x1, y2-y1);
			var normal = direction.normal().normalise();

			var from = graph.getEdges(edge.source, edge.target);
			var to = graph.getEdges(edge.target, edge.source);

			var total = from.length + to.length;

			// Figure out edge's position in relation to other edges between the same nodes
			var n = 0;
			for (var i=0; i<from.length; i++) {
				if (from[i].id === edge.id) {
					n = i;
				}
			}

			var spacing = 6.0;

			// Figure out how far off center the line should be drawn
			var offset = normal.multiply(-((total - 1) * spacing)/2.0 + (n * spacing));

			var s1 = toScreen(p1).add(offset),
			    s2 = toScreen(p2).add(offset),
                r  = edge.target.data.radius;

			var intersection = intersect_line_box(s1, s2, {x: x2-r/2.0, y: y2-r/2.0}, r, r);

			if (!intersection) {
				intersection = s2;
			}

			var stroke = typeof(edge.data.colour) !== 'undefined' ? edge.data.colour : '#000000';

			var arrowWidth,
			    arrowLength;

			var weight = typeof(edge.data.weight) !== 'undefined' ? edge.data.weight : 1.0;

			ctx.lineWidth = Math.max(weight *  2, 0.1);
			arrowWidth = 1 + ctx.lineWidth;
			arrowLength = 8;

			var directional = typeof(edge.data.directional) !== 'undefined' ? edge.data.directional : true;

			// line
			var lineEnd;
			if (directional) {
				lineEnd = intersection.subtract(direction.normalise().multiply(arrowLength * 0.5));
			} else {
				lineEnd = s2;
			}

			ctx.strokeStyle = stroke;
			ctx.beginPath();
			ctx.moveTo(s1.x, s1.y);
			ctx.lineTo(lineEnd.x, lineEnd.y);
			ctx.stroke();

			// arrow
			if (directional) {
				ctx.save();
				ctx.fillStyle = stroke;
				ctx.translate(intersection.x, intersection.y);
				ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
				ctx.beginPath();
				ctx.moveTo(-arrowLength, arrowWidth);
				ctx.lineTo(0, 0);
				ctx.lineTo(-arrowLength, -arrowWidth);
				ctx.lineTo(-arrowLength * 0.8, -0);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			}
		},

		function drawNode(node, p) {
			var s = toScreen(p);

			ctx.save();

            var r = node.data.radius;

			// fill background based on nearest/selected node
            ctx.fillStyle = node.data.fill;
			if (selected !== null && nearest.node !== null && selected.node.id === node.id) {
                r *= 2; // embiggen the selected node
			} else if (nearest !== null && nearest.node !== null && nearest.node.id === node.id) {
                //ctx.fillStyle = "#FFFF00";
			} else {
                // node fill colour
                //ctx.fillStyle = node.data.fill;
			}

            if (node.data.islatest) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(s.x, s.y, r*1.5, 0, PIx2, false);
                ctx.fillStyle = bg_colour;
                ctx.fill();
                ctx.lineWidth = 5;
                ctx.strokeStyle = edge_colour;
                ctx.stroke();
			    ctx.restore();
            }

            ctx.beginPath();
            ctx.arc(s.x, s.y, r, 0, PIx2, false);
            ctx.fill();
            ctx.lineWidth = node.data.lineWidth;
            ctx.strokeStyle = node.data.stroke;
            ctx.stroke();

			ctx.restore();
		},

        function drawOverlay() {
			if (selected !== null && nearest.node !== null) {
                // draw the sequence for the selected node
                var r   = 20,
                    pad = 10,
                    pos = { "x":r+pad, "y":r+pad };
                ctx.save();
                for (i=0; i<selected.node.data.sequence.length; i++) {
                    var c_idx = selected.node.data.sequence[i];
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, r, 0, PIx2, false);
                    ctx.fillStyle = btn_colours[c_idx];
                    ctx.fill();
                    ctx.lineWidth = 0.5;
                    ctx.strokeStyle = "#333333";
                    ctx.stroke();
                    pos.x += r*2 + pad;
                }
                ctx.restore();
            }
        }
	);

	renderer.start();

	// helpers for figuring out where to draw arrows
	function intersect_line_line(p1, p2, p3, p4) {
		var denom = ((p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y));

		// lines are parallel
		if (denom === 0) {
			return false;
		}

		var ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;
		var ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;

		if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
			return false;
		}

		return new Vector(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
	}

	function intersect_line_box(p1, p2, p3, w, h) {
		var tl = {x: p3.x, y: p3.y};
		var tr = {x: p3.x + w, y: p3.y};
		var bl = {x: p3.x, y: p3.y + h};
		var br = {x: p3.x + w, y: p3.y + h};

		var result;
		if (result = intersect_line_line(p1, p2, tl, tr)) { return result; } // top
		if (result = intersect_line_line(p1, p2, tr, br)) { return result; } // right
		if (result = intersect_line_line(p1, p2, br, bl)) { return result; } // bottom
		if (result = intersect_line_line(p1, p2, bl, tl)) { return result; } // left

		return false;
	}

	return this;
}

})();
