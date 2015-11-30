/**
 * Single particle.
 * Fundamental concept - it is immutable.
 * It feels immutability reflects quantum mechanics in a way.
 */
var audioCtx = require('audio-context');
var random = require('distributions-normal-random/lib/number');
var extend = require('xtend/mutable');
var clamp = require('mumath/clamp');
var len = require('mumath/len');

module.exports = Particle;



/**
 * A unit of matter
 */
function Particle (options) {
	//ignore reinit
	if (options instanceof Particle) {
		return extend(this, options);
	}

	//current position
	this.x = random(200, 100);
	this.y = random(200, 100);

	//velocity of the particle
	this.vx = 0;
	this.vy = 0;

	this.ax = 0;
	this.ay = 0;

	//size
	this.mass = random(40, 40/3);

	extend(this, options);
}

/**
 * Spawn new particle state in the world, observe-act-react
 */
Particle.prototype.spawn = function (world) {
	return new Particle(this.observe(world).act(world).react(world));
};


/**
 * Look at the world, other particles, create own values = goals
 */
Particle.prototype.observe = function (world) {
	var self = new Particle(this);

	var particles = world.particles;

	//attraction to other particles create squared accleration
	//the king of clubbing particle
	var ax = 0, ay = 0;
	particles.forEach(function (particle) {
		if (particle === self) return;
		ax += (particle.x - self.x) * particle.mass / self.mass;
		ay += (particle.y - self.y) * particle.mass / self.mass;
	});

	//own values (goals to move) - might be assessed unclearly
	self.ax = random(ax / (particles.length - 1), 0.0) || 0;
	self.ay = random(ay / (particles.length - 1), 0.0) || 0;

	//some decreaser
	self.ax *= 0.01;
	self.ay *= 0.01;

	return self;
};


/**
 * Act according to the goals
 */
Particle.prototype.act = function (world) {
	var self = new Particle(this);

	self.vx += self.ax;
	self.vy += self.ay;

	var dX = self.vx * 0.01;
	var dY = self.vy * 0.01;

	self.x += dX;
	self.y += dY;

	return self;
};


/**
 * React on limitations of the physics
 */
Particle.prototype.react = function (world) {
	var self = new Particle(this);

	//inverse bounds
	// if (this.x > container[2] || this.x < container[0]) {
	// 	this.vx = -this.vx;
	// 	this.x = clamp(this.x, container[0], container[2]);
	// }
	// if (this.y > container[3] || this.y < container[0]) {
	// 	this.vy = -this.vy;
	// 	this.y = clamp(this.y, container[1], container[3]);
	// }

	return self;
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