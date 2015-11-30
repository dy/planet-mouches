var Canvas = require('drawille-canvas');
var raf = require('raf');
var Particle = require('./lib/particle');
var clamp = require('mumath/clamp');

//create space
var canvas = new Canvas(window.innerWidth - 20, window.innerHeight - 20);
document.body.appendChild(canvas);
var w = canvas.width;
var h = canvas.height;


var particles = [];

//add one huge driving particle (blackhole)
// var driver = new Particle({mass: 4320000});
// particles.push(driver);


//create set of particles
for (var i = 0; i < 3; i++) {
	var p = new Particle({
	});
	particles.push(p);
}


//create particle by wish of the god
canvas.addEventListener('mousedown', function (e) {
	particles.push(new Particle({
		x: e.offsetX,
		y: e.offsetY
	}));
});


//create interaction of particles in turn (live)
var interval = 1;
setInterval(function () {
	//handle all particles syncronously
	particles = particles.map(function (particle) {
		return particle
		.observe(particles, [0,0,w,h])
		.act()
		.react([0,0,w,h]);
	});
}, interval);


//light up particles
raf(function draw () {
	particles.forEach(function (particle) {
		particle.render(canvas);
	});

	raf(draw);
});