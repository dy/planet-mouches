/**
 * Single particle
 */
var audioCtx = require('audio-context');
var random = require('distributions-normal-random/lib/number');
var extend = require('xtend/mutable');


module.exports = Particle;


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
	this.mass = clamp(random(30, 10), 0.1, 30);

	this.color = 'black';


	extend(this, options);
}

/**
 * Look at the world (other particles), create own values = goals
 */
Particle.prototype.setGoals = function (particles, container, step) {
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
	this.ax = random(ax / (particles.length - 1), 0.13) || 0;
	this.ay = random(ay / (particles.length - 1), 0.13) || 0;
};


/**
 * React according to the own values
 */
Particle.prototype.act = function (step) {
	var self = this;

	this.vx += this.ax * step;
	this.vy += this.ay * step;

	var dX = this.vx * step;
	var dY = this.vy * step;

	this.x += dX;
	this.y += dY;
};


/**
 * React on limitations of the physics
 */
Particle.prototype.react = function (container, step) {
	//inverse bounds
	if (this.x > container[2] || this.x < container[0]) {
		this.vx = -this.vx;
		this.x = clamp(this.x, container[0], container[2]);
	}
	if (this.y > container[3] || this.y < container[0]) {
		this.vy = -this.vy;
		this.y = clamp(this.y, container[1], container[3]);
	}
};


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


function clamp(a, min, max) {
	return Math.max(min, Math.min(max, a));
}
function len (x, y) {
	return Math.sqrt(x*x + y*y) || 0;
}