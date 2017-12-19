'use strict';

// Private variables
var center = undefined,
segments = [], // For recursive drawing
segIndex = [], // For linear indexing
color = "#000000",
scale = 1.0,
maxPivotSize = 10,
name = undefined,
numSegments = 0;

// Each segment should have: id, angle, length,
// thickness, circle, and connectedSegments, anchor


var stickObject = function(c, n) {
	center = c;
	name = n;
}

stickObject.prototype.getName = function() { return name; }
stickObject.prototype.setName = function(n) { name = n; }

stickObject.prototype.getCenter = function() { return center; }
stickObject.prototype.setCenter = function(c) { center = c; }

stickObject.prototype.getColor = function() { return color; }
stickObject.prototype.setColor = function(col) { color = col; } 

stickObject.prototype.addSegment = function(seg) {
	var indexSegs = function(seg) {
		segIndex[numSegments] = seg;
		seg.id = numSegments++;
		seg.connectedSegments.forEach(function (s) {
			indexSegs(s);
		});
	};
	indexSegs(seg);
	segments.push(seg);
	return this;
}

stickObject.prototype.dragPoint = function(p, e) {
	if (p['center']) { // Dragging center point
		center = e;
	}
	else {
		console.log(p);
		console.log(segIndex);
		var seg = segIndex[p['seg_id']];
		seg.angle = Math.atan2(e.y - seg.anchor.y, e.x - seg.anchor.x);
	}
}

stickObject.prototype.drawObject = function(ctx) {
	// This function draws all connected segments recursively
	var drawSegments = function(ctx, seg, startPoint, angle) {
		ctx.beginPath();
		ctx.lineWidth = seg.thickness * scale;
		var endpoint = {
			x: startPoint.x + seg.length * scale * Math.cos(seg.angle + angle),
			y: startPoint.y + seg.length * scale * Math.sin(seg.angle + angle)
		};
		if (!seg.circle) {
			ctx.moveTo(startPoint.x, startPoint.y);
			ctx.lineTo(endpoint.x, endpoint.y);
		}	
		else {
			ctx.arc((startPoint.x + endpoint.x) / 2, 
				(startPoint.y + endpoint.y) / 2, 
				seg.length / 2, 
				0, Math.PI * 2);
		}
		ctx.stroke();
		seg.connectedSegments.forEach(function(s) {
			drawSegments(ctx, s, endpoint, angle + seg.angle);
		});
	};

	// Draw all segments
	ctx.strokeStyle = color;
	segments.forEach(function(segment) {
		drawSegments(ctx, segment, center, 0);
	});
}

stickObject.prototype.drawPivots = function(ctx) {
	var pointsArray = [];
	// This function draws all points recursively
	var drawPoints = function(ctx, seg, startPoint, angle) {
		ctx.beginPath();
		ctx.lineWidth = Math.min(seg.thickness * scale, maxPivotSize);
		var endpoint = {
			x: startPoint.x + seg.length * scale * Math.cos(seg.angle + angle),
			y: startPoint.y + seg.length * scale * Math.sin(seg.angle + angle)
		};		
		ctx.moveTo(endpoint.x, endpoint.y);
		ctx.lineTo(endpoint.x, endpoint.y);	
		ctx.stroke();
		// Add to points array
		pointsArray.push({
			x: endpoint.x,
			y: endpoint.y,
			radius: ctx.lineWidth / 2,
			name: name,
			seg_id: seg.id
		});
		seg.anchor = startPoint;
		seg.connectedSegments.forEach(function(s) {
			drawPoints(ctx, s, endpoint, angle + seg.angle);
		});
	};

	// Draw center point
	ctx.strokeStyle = "#ffaa00";
	ctx.beginPath();
	ctx.lineWidth = maxPivotSize;
	ctx.moveTo(center.x, center.y);
	ctx.lineTo(center.x, center.y);
	ctx.stroke();

	// Add center point to array
	pointsArray.push({
		x: center.x,
		y: center.y,
		radius: maxPivotSize / 2,
		name: name,
		center: true
	});

	// Draw other pivot points
	ctx.strokeStyle = "#ff0000";
	segments.forEach(function(segment) {
		drawPoints(ctx, segment, center, 0);
	});

	return pointsArray;
}