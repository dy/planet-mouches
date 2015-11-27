var Canvas = require('drawille-canvas');
var random = require('distributions-normal-random/lib/number');
var raf = require('raf');
var extend = require('xtend/mutable');


//create rendering vacuum
var canvas = new Canvas(window.innerWidth - 20, window.innerHeight - 20);
document.body.appendChild(canvas);
var w = canvas.width;
var h = canvas.height;



/**
 * Single particle
 */
function Particle (options) {
	//current position
	this.x = random(w/2, 100);
	this.y = random(h/2, 100);

	//velocity of the particle
	this.vx = random(1,0.1);
	this.vy = random(1,0.1);

	this.ax = 0;
	this.ay = 0;

	//size
	this.mass = random(10, 1);

	this.color = 'black';

	extend(this, options);
}


/**
 * Look at the world (other particles), react on that (move?)
 */
Particle.prototype.react = function (particles, container, step) {
	var self = this;

	//attraction to other particles create squared accleration
	var ax = 0, ay = 0;
	particles.forEach(function (particle) {
		if (particle === self) return;
		ax += (particle.x - self.x) / self.mass;
		ay += (particle.y - self.y) / self.mass;
	});
	this.ax = random(ax / (particles.length - 1), 1);
	this.ay = random(ay / (particles.length - 1), 1);

	this.vx += this.ax * step;
	this.vy += this.ay * step;

	//self movement
	var dX = this.vx * step;
	var dY = this.vy * step;

	//inverse bounds
	if (this.x + dX > container[2] || this.x + dX < container[0]) {
		dX = -dX;
		this.vx = -this.vx;
	}
	if (this.y + dY > container[3] || this.y + dY < container[0]) {
		dY = -dY;
		this.vy = -this.vy;
	}

	this.x += dX;
	this.y += dY;
};



//create set of particles (our universe)
var particles = [];
for (var i = 0; i < 3; i++) {
	var p = new Particle({
		color: 'black'
	});
	particles.push(p);
}


//create interaction (live)
var interval = 1;
setInterval(function () {
	particles.forEach(function (particle) {
		particle.react(particles, [0,0,w,h], 0.02);
	});
}, interval);



/**
 * Trace movement of particles
 */
raf(function draw () {
	var ctx = canvas.getContext('2d');

	//for each particle - draw current position
	particles.forEach(function (particle) {
		var v = Math.sqrt((particle.vx + particle.vy) * (particle.vx + particle.vy));

		ctx.fillStyle = 'hsl(' + particle.mass * 5 + ', ' + v + '%, 50%)'

		ctx.fillRect(particle.x, particle.y, 1 + particle.mass / 5, 1 + particle.mass / 5);
	});

	raf(draw);
});



//helpers
function getDistance (p1, p2) {
	return Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y));
}
function getAngle (p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}