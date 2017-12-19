// DOM Elements and global variables
var canvas,
ctx,
objects = {}, // stickObject mapped by name
points = [],  // All pivot points with x, y, name, radius
dragPoint = undefined,
mouseDown = false;

var initGame = function () {
	canvas = document.getElementById("game-surface");
	canvas.addEventListener('mousemove', pivotMoveListener);
	canvas.addEventListener('mousedown', pivotDownListener);
	canvas.addEventListener('mouseup', pivotUpListener);
	ctx = canvas.getContext("2d");
	ctx.lineCap="round";

	var torso = {
		angle: Math.PI * 3 / 2, 
		length: 180,
		thickness: 10,
		circle: false,
		connectedSegments: [
		{ // Right arm
			angle: 3 * Math.PI / 4,
			length: 135,
			thickness: 8,
			circle: false,
			connectedSegments: []
		},
		{ // Left arm
			angle: 5 * Math.PI / 4,
			length: 135,
			thickness: 8,
			circle: false,
			connectedSegments: []
		},
		{ // Head
			angle: 0,
			length: 60,
			thickness: 8,
			circle: true,
			connectedSegments: []
		}
		]
	}
	var leg1 = {
		angle: Math.PI * 3 / 4,
		length: 140,
		thickness: 12,
		circle: false,
		connectedSegments: [
			{
				angle: -Math.PI / 8,
				length: 135,
				thickness: 11,
				circle: false,
				connectedSegments: []
			}
		]
	}
	var leg2 = {
		angle: Math.PI / 4,
		length: 140,
		thickness: 12,
		circle: false,
		connectedSegments: [
			{
				angle: Math.PI / 8,
				length: 135,
				thickness: 11,
				circle: false,
				connectedSegments: []
			}
		]
	}

	var stickman = new stickObject({
		x: canvas.width / 2, 
		y: canvas.height / 2
	}, 'stickman');
	stickman.addSegment(torso).addSegment(leg1).addSegment(leg2);

	addObject(objects, stickman);
	drawObjects(objects);

};



var addObject = function(objArray, obj) {
	var i = 1;

	// If name already exists
	if (objArray[obj.getName()]) {
		while (objArray[obj.getName() + '_' + i]) { i++; }
		obj.setName(obj.getName() + '_' + i);
	}

	objArray[obj.getName()] = obj;
}

var drawObjects = function(objArray) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	points = [];

	// Draw all segments
	Object.keys(objArray).forEach(function (o) {
		objArray[o].drawObject(ctx);
	});
	// Draw pivots on top
	Object.keys(objArray).forEach(function (o) {
		// Add the points to the points array
		points = points.concat(objArray[o].drawPivots(ctx));
	});
};

// Move points!
var pivotMoveListener = function(event) {

	if (mouseDown && dragPoint) {
		// if (dragPoint['center']) { // Move the center point
		// 	objects[dragPoint.name].setCenter({x: event.offsetX, y: event.offsetY});
		// }
		// else { // Rotate a segment
		// 	objects[dragPoint.name].rotateSegment()
		// }

		objects[dragPoint.name].dragPoint(dragPoint, {x: event.offsetX, y: event.offsetY});
		drawObjects(objects);
		print("Dragging a point");
	}
};

var pivotDownListener = function(event) {
	mouseDown = true;
	// Search through points
	for (var p in points) {
		// If the mouse is within the point's radius
		if (Math.sqrt(Math.pow(points[p].x - event.offsetX, 2) + 
			Math.pow(points[p].y - event.offsetY, 2)) <= points[p].radius) 
		{
			dragPoint = points[p];
			break;
		}
	};
};

var pivotUpListener = function(event) { 
	mouseDown = false; 
	dragPoint = undefined;
};

var print = function(m) { console.log(m); };