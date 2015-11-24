var Canvas = require('drawille-canvas');
var random = require('distributions-normal-random/lib/number');
var raf = require('raf');

var canvas = new Canvas(600, 600);
var ctx = canvas.getContext('2d');
var w = canvas.width;
var h = canvas.height;

document.body.appendChild(canvas);


var offsetX = w / 2;
var offsetY = h / 2;
var angle = random(Math.PI, Math.PI);


//TODO: the very big task is to create the pole of emptiness and density, to avoid overdensed/overspaced

function ray () {
	//create a point
	var distance = random(5, 2);
	angle += random(0, Math.PI / 120);

	var dX = Math.cos(angle) * distance;
	var dY = Math.sin(angle) * distance;

	//inverse bounds
	if (offsetX + dX > w || offsetX + dX < 0) {
		dX = -dX;
		angle = Math.PI - angle;
	}
	if (offsetY + dY > h || offsetY + dY < 0) {
		dY = -dY;
		angle = - angle;
	}

	offsetX += dX;
	offsetY += dY;

	var size = random(2, 0.5);

	ctx.fillRect(offsetX, offsetY, size, size);
}

raf(function draw () {
	ray();
	raf(draw);
});