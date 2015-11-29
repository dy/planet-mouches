var Canvas = require('drawille-canvas');
var raf = require('raf');
var Particle = require('./lib/particle');


//create rendering vacuum
var canvas = new Canvas(window.innerWidth - 20, window.innerHeight - 20);
document.body.appendChild(canvas);
var w = canvas.width;
var h = canvas.height;


//create set of particles (our universe)
var particles = [];

//add one huge driving particle (blackhole)
var driver = new Particle({mass: 432});
particles.push(driver);


for (var i = 0; i < 2; i++) {
	var p = new Particle({
		color: 'black'
	});
	particles.push(p);
}


//create particle
canvas.addEventListener('mousedown', function (e) {
	particles.push(new Particle({
		x: e.offsetX,
		y: e.offsetY
	}));
});

//add direct control for the driver (discontinuous in all derivatives)
// canvas.addEventListener('mousedown', function (e) {
// 	set(e);
// 	canvas.addEventListener('mousemove', set);

// 	function set (e) {
// 		driver.x = e.offsetX;
// 		driver.y = e.offsetY;
// 		driver.vx = 0;
// 		driver.vy = 0;
// 		driver.ax = 0;
// 		driver.ay = 0;
// 	}

// 	canvas.addEventListener('mouseup', function end () {
// 		canvas.removeEventListener('mousemove', set);
// 		canvas.removeEventListener('mouseup', end);
// 	});
// });


//create interaction of particles (live)
var interval = 1;
setInterval(function () {
	particles.forEach(function (particle) {
		particle.setGoals(particles, [0,0,w,h], 0.01);
		particle.act(0.01);
		particle.react([0,0,w,h], 0.01);
	});
}, interval);




/**
 * Trace movement of particles
 */
raf(function draw () {
	var ctx = canvas.getContext('2d');

	ctx.fillStyle = 'rgba(255,255,255,.03)';
	ctx.fillRect(0,0,w,h);

	var maxDist = Math.sqrt(w*w + h*h);
	particles.forEach(function (particle) {
		var maxVol = 0.1, vol = 1, detune = 0;

		var dist = Math.sqrt((driver.x - particle.x)*(driver.x - particle.x) + (driver.y - particle.y)*(driver.y - particle.y));

		//for each particle - draw current position
		var v = particle.velocity;
		var a = particle.accleration;

		//f is dopler effect - how much v vector is towards the target
		var distV = [driver.x - particle.x, driver.y - particle.y];
		var velV = [particle.vx, particle.vy];
		var angle = (distV[0]*velV[0] + distV[1] + velV[1]) / (particle.velocity * Math.sqrt(distV[0]*distV[0] + distV[1]*distV[1])) || 0;
		angle = clamp(angle, -Math.PI, Math.PI);


		//set oscillator frequency relative to the driver
		if (particle !== driver) {
			//volume depends on distance
			vol = clamp(maxVol - dist*2.5/maxDist, 0, 1);
			particle.gain.gain.value = vol;

			//doppler mini effect
			detune = (angle/Math.PI) * 100 || 0;
			particle.oscillator.detune.value = detune;
		}



		ctx.fillStyle = 'hsla(' + (v*particle.mass/50 - detune) + ', ' + clamp(v*particle.mass, 0, 90) + '%, ' + clamp(v + v*particle.mass/40, 0, 60) + '%, ' + clamp(v*particle.mass/130,0,.9) + ')';

		ctx.beginPath();
		ctx.arc(particle.x, particle.y, clamp(vol/maxVol, 0.2, 1) * 3 * clamp(particle.mass / 5, 1, 4), 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();

	});

	raf(draw);
});


function clamp(a, min, max) {
	return Math.max(min, Math.min(max, a));
}