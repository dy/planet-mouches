/**
 * Cell is a particle, able to divide
 */

var Particle = require('./particle');
var inherits = require('inherits');


function Cell (options) {
	Particle.call(this, options);
}

inherits(Cell, Particle);


Cell.