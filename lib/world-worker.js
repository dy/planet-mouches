/**
 * A webworker interface for the world
 */

var World = require('./world');
var Particle = require('./particle');

module.exports = function (self) {
	var world = new World();

	//default setting
	world.add(new Particle());

	var batchSize = 1;

	var busy = false;

	function process() {
		var states = [];

		//calc batch of data
		var maxDelay = 10;
		var start = Date.now();

		for (var i = 0; i < batchSize; i+= world.particles.length) {
			world = world.spawn();
			states.push(world);

			//if deadline - release batch (responsive)
			//particles calc is O(n²) at least
			if (Date.now() - start > maxDelay) break;
		}

		//form data as a set of particles to send
		//render particles to array
		//the protocol is x, y, mass, velocity
		var data = [];

		states.forEach(function (world) {
			world.particles.forEach(function (particle) {
				data.push(particle.x);
				data.push(particle.y);
				data.push(particle.mass);
				data.push(particle.velocity);
			});
		});

		var rawData = new Float32Array(data);

		//send simplified particles data
		self.postMessage({
			buffer: rawData.buffer
		}, [rawData.buffer]);
	}


	//messages are controls from the observer
	self.onmessage = function(e){
		if (e.data.createParticle) {
			world.add(new Particle(e.data.createParticle))
		}

		if (e.data.setSpeed != null) {
			batchSize = e.data.setSpeed;
		}

		if (e.data.process != null) {
			process();
		}
	};
}