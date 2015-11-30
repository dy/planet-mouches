/**
 * Our model of the world
 */


var Particle = require('./particle');
var extend = require('xtend/mutable');

module.exports = World;


function World (options) {
	this.particles = [];

	extend(this, options);
}


/**
 * get the next consequent state of the world.
 * In quantum mechanics it actualizes the probability model.
 */
World.prototype.spawn = function () {
	var self = this;

	//recalculate particles
	var particles = self.particles.map(function (particle) {
		return particle.spawn(self);
	});

	return new World({particles: particles});
};


/**
 * Create a new particle
 */
World.prototype.add = function (particle) {
	if (!particle) particle = new Particle();

	this.particles.push(particle);
};