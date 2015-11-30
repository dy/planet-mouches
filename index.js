/**
 * Hook up the game. Mostly technical stuff here.
 *
 * @True {[type]}
 */
var Canvas = require('drawille-canvas');
var raf = require('raf');
var work = require('webworkify');
var worldWorker = work(require('./lib/world-worker'));
var mod = require('mumath/mod');
var clamp = require('mumath/clamp');
var now = require('performance-now');


//create viewport
var canvas = new Canvas(window.innerWidth - 20, window.innerHeight - 20);
document.body.appendChild(canvas);
canvas.setAttribute('style', '-webkit-user-select: none;user-select: none; user-drag: none; -webkit-user-drag: none;')


//create particle by wish of the user
canvas.addEventListener('mousedown', function (e) {
	worldWorker.postMessage({
		createParticle: {
			x: e.offsetX,
			y: e.offsetY
		}
	});
});


//create simple controller of the speed of the world
var speedInput = document.createElement('input');
speedInput.type = 'range';
speedInput.min = 1;
speedInput.value = 1;
speedInput.max = 500;
speedInput.step = 1;
document.body.appendChild(speedInput);
speedInput.setAttribute('style', 'position: absolute; bottom: 0; right: 0%');
speedInput.addEventListener('input', function () {
	var speed = parseInt(speedInput.value);
	worldWorker.postMessage({
		setSpeed: speed
	});
});


//on messages from the worker - collect particles for rendering
var points = [];
worldWorker.addEventListener('message', function (e) {
	var data = new Float32Array(e.data.buffer);
	for (var i = 0; i < data.length; i+=4) {
		points.push({
			x: data[i],
			y: data[i+1],
			mass: data[i+2],
			v: data[i+3]
		});
	}
});


//rendering cycle
raf(function draw() {
	var ctx = canvas.getContext('2d');
	var w = canvas.width;
	var h = canvas.height;

	points.forEach(function (particle) {
		var x = mod(particle.x, 0, w);
		var y = mod(particle.y, 0, h);

		//for each particle - draw current position
		ctx.fillStyle = 'hsl(' + (particle.v*particle.mass/100) + ', ' + clamp(particle.v*particle.mass, 0, 90) + '%, ' + clamp(particle.v + particle.v*particle.mass/40, 0, 60) + '%)';

		ctx.beginPath();
		ctx.arc(x, y, clamp(particle.mass / 30, 1, 6), 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
	});

	//clear renderdata
	points.length = 0;

	worldWorker.postMessage({process: true});

	raf(draw);
});