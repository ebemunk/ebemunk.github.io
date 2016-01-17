var LINE_DIST = 125;
var HOVER_DIST = 125;
var DIM_OPACITY = 0.05;

var bg = d3.select('#bg');
var g = bg.append('g');
var bbox = bg.node().getBoundingClientRect();

var circleData = _.range(150).map(function() {
	return {
		cx: _.random(0, bbox.width),
		cy: _.random(0, bbox.height),
		r: _.random(2, 6),
		opacity: _.random(0.3, 0.9)
	};
});

var quadtree = d3.geom.quadtree()
	.x(function(d) {return d.cx})
	.y(function(d) {return d.cy})
	(circleData)
;

var circles = g.selectAll('circle').data(circleData).enter()
	.append('circle')
		.attr('cx', function(d) {return d.cx})
		.attr('cy', function(d) {return d.cy})
		.attr('r', function(d) {return d.r})
		.classed('dot', true)
		.style('opacity', 0.1)
;

var lineData = [];

circleData.forEach(function(d) {
	var points  = closePoints(d);

	points.forEach(function(p) {
		var dx = d.cx - p.cx;
		var dy = d.cy - p.cy;

		if( dx*dx + dy*dy < LINE_DIST*LINE_DIST ) {
			lineData.push({
				x1: d.cx,
				y1: d.cy,
				x2: p.cx,
				y2: p.cy
			});
		}
	});
});

g.selectAll('line').data(lineData).enter()
	.append('line')
		.attr('x1', function(d) {return d.x1})
		.attr('y1', function(d) {return d.y1})
		.attr('x2', function(d) {return d.x2})
		.attr('y2', function(d) {return d.y2})
		.classed('line', true)
;

d3.select('body').on('mousemove', function () {
	var mouse = d3.mouse(this);
	var d = {
		cx: mouse[0],
		cy: mouse[1]
	};

	var points = closePoints(d);

	circles.style('opacity', DIM_OPACITY)
	circles.each(function(d){d.highlight = false})

	points.forEach(function(p) {
		var dx = d.cx - p.cx;
		var dy = d.cy - p.cy;

		if( dx*dx + dy*dy < HOVER_DIST*HOVER_DIST ) {
			p.highlight = true;
		}
	});

	circles.style('opacity', function(d) {return d.highlight ? d.opacity : DIM_OPACITY})
});

function closePoints(d) {
	var points = [];

	var x0, y0, x3, y3;
	x0 = Math.max(0, d.cx - LINE_DIST);
	y0 = Math.max(0, d.cy - LINE_DIST);
	x3 = Math.min(bbox.width, d.cx + LINE_DIST);
	y3 = Math.min(bbox.height, d.cy + LINE_DIST);

	quadtree.visit(function(node, x1, y1, x2, y2) {
		if( node.point ) {
			points.push(node.point);
		}

		return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
	});

	return points;
}

var disco = false;
d3.select('#disco').on('click', function (e) {
	d3.event.preventDefault();
	disco = !disco;
	discoMode();
});

var colors = ['#22A7F0','#8E44AD','#AEA8D3','#F62459','#DB0A5B','#D64541','#D2527F','#2C3E50','#1E8BC3','#87D37C','#4ECDC4','#3FC380','#E87E04','#F9690E','#F9BF3B'];
var c = _.sampleSize(colors, 2);
var d = _.random(0, 360);
discoMode();
function discoMode() {
	d += 1;
	d = d % 360;

	bg.style('background', 'linear-gradient(' + d + 'deg,' + c + ')');

	if( disco ) {
		window.requestAnimationFrame(discoMode);
	}
}
