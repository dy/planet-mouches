/**
 * Single particle.
 * Fundamental concept - it is immutable.
 * It feels immutability reflects quantum mechanics in a way.
 */
var audioCtx = require('audio-context');
var random = require('distributions-normal-random/lib/number');
var extend = require('xtend/mutable');
var clamp = require('mumath/clamp');
var mod = require('mumath/mod');

module.exports = Particle;



/**
 * A unit of matter
 */
function Particle (options) {
	//current position
	this.x = random(200, 100);
	this.y = random(200, 100);

	//velocity of the particle
	this.vx = 0;
	this.vy = 0;

	this.ax = 0;
	this.ay = 0;

	//size
	this.mass = random(20, 0);

	extend(this, options);
}


/**
 * Look at the world, other particles, create own values = goals
 */
Particle.prototype.observe = function (particles, container) {
	var self = this;

	//attraction to other particles create squared accleration
	//the king of clubbing particle
	var ax = 0, ay = 0;
	particles.forEach(function (particle) {
		if (particle === self) return;
		ax += (particle.x - self.x) * particle.mass / self.mass;
		ay += (particle.y - self.y) * particle.mass / self.mass;
	});

	//own values (goals to move) - might be assessed unclearly
	this.ax = random(ax / (particles.length - 1), 0.0) || 0;
	this.ay = random(ay / (particles.length - 1), 0.0) || 0;

	//some decreaser
	this.ax *= 0.01;
	this.ay *= 0.01;

	return this.spawn();
};


/**
 * Act according to the goals
 */
Particle.prototype.act = function () {
	var self = this;

	this.vx += this.ax;
	this.vy += this.ay;

	var dX = this.vx * 0.01;
	var dY = this.vy * 0.01;

	this.x += dX;
	this.y += dY;

	return this.spawn();
};


/**
 * React on limitations of the physics
 */
Particle.prototype.react = function (container) {
	//inverse bounds
	// if (this.x > container[2] || this.x < container[0]) {
	// 	this.vx = -this.vx;
	// 	this.x = clamp(this.x, container[0], container[2]);
	// }
	// if (this.y > container[3] || this.y < container[0]) {
	// 	this.vy = -this.vy;
	// 	this.y = clamp(this.y, container[1], container[3]);
	// }

	return this.spawn();
};


/**
 * Spawn a clone of that particle
 */
Particle.prototype.spawn = function () {
	return new Particle(this);
};


/**
 * Present itself (react on light)
 */
Particle.prototype.render = function (canvas) {
	var ctx = canvas.getContext('2d');

	var w = canvas.width;
	var h = canvas.height;

	//loop rendering, not the real position
	var x = mod(this.x, 0, w);
	var y = mod(this.y, 0, h);

	var v = this.velocity;
	var a = this.accleration;

	//for each particle - draw current position
	ctx.fillStyle = 'hsl(' + (v*this.mass/100) + ', ' + clamp(v*this.mass, 0, 90) + '%, ' + clamp(v + v*this.mass/40, 0, 60) + '%)';

	ctx.beginPath();
	ctx.arc(x, y, clamp(this.mass / 30, 1, 6), 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
};


/**
 * Some other points of view on the particle, or metrics
 */
Object.defineProperties(Particle.prototype, {
	velocity: {
		get: function () {
			return len(this.vx, this.vy);
		},
		set: function (value) {
			xxx
		}
	},
	accleration: {
		get: function () {
			return len(this.ax, this.ay);
		},
		set: function (value) {
			xxx
		}
	}
});



//utils
function len (x, y) {
	return Math.sqrt(x*x + y*y) || 0;
}