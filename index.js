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
	this.vx = 0;
	this.vy = 0;

	this.ax = 0;
	this.ay = 0;

	//size
	this.mass = random(1, 0.1);

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
		ax += (particle.x - self.x) / self.mass;
		ay += (particle.y - self.y) / self.mass;
	});

	//own values (goals to move) - might be assessed unclearly
	this.ax = random(ax / (particles.length - 1), 0.1);
	this.ay = random(ay / (particles.length - 1), 0.1);
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



//create set of particles (our universe)
var particles = [];
for (var i = 0; i < 3; i++) {
	var p = new Particle({
		color: 'black'
	});
	particles.push(p);
}


//add one huge driving particle (blackhole)
var driver = new Particle({mass: 100});
particles.push(driver);

//add direct control for the driver (discontinuous in all derivatives)
canvas.addEventListener('mousedown', function (e) {
	set(e);
	canvas.addEventListener('mousemove', set);

	function set (e) {
		driver.x = e.offsetX;
		driver.y = e.offsetY;
		driver.vx = 0;
		driver.vy = 0;
		driver.ax = 0;
		driver.ay = 0;
	}

	canvas.addEventListener('mouseup', function end () {
		canvas.removeEventListener('mousemove', set);
		canvas.removeEventListener('mouseup', end);
	});
});


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

	//for each particle - draw current position
	particles.forEach(function (particle) {
		var v = Math.sqrt((particle.vx + particle.vy) * (particle.vx + particle.vy));

		ctx.fillStyle = 'hsl(' + particle.mass * 5 + ', ' + clamp(v, 15, 90) + '%, ' + 1 / particle.mass * 50 + '%)'

		ctx.fillRect(particle.x, particle.y, clamp(particle.mass / 5, 1, 5), clamp(particle.mass / 5, 1, 5));
	});

	raf(draw);
});



//helpers
function clamp(a, min, max) {
	return Math.max(min, Math.min(max, a));
}
function getDistance (p1, p2) {
	return Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y));
}
function getAngle (p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}