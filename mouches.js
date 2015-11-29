(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
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
},{"./lib/particle":3,"drawille-canvas":8,"raf":9}],3:[function(require,module,exports){
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
	this.mass = clamp(random(4, 1.3), 0.1, 30);

	this.color = 'black';


	extend(this, options);



	// create Oscillator node
	this.oscillator = audioCtx.createOscillator();

	this.oscillator.type = 'sine';
	this.oscillator.setPeriodicWave(
		audioCtx.createPeriodicWave(
			new Float32Array([0, random(.9,.1), random(0.1, 0.03), random(0.03, 0.01)]), new Float32Array([0, 0, 0, 0.01])
		)
	);
	this.oscillator.frequency.value =  432*Math.exp(1/this.mass);
	this.oscillator.start();

	this.gain = audioCtx.createGain();
	this.gain.gain.value = 0;

	this.oscillator.connect(this.gain);
	this.gain.connect(audioCtx.destination);
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
},{"audio-context":4,"distributions-normal-random/lib/number":7,"xtend/mutable":11}],4:[function(require,module,exports){
var window = require('global/window');

var Context = window.AudioContext || window.webkitAudioContext;
if (Context) module.exports = new Context;

},{"global/window":5}],5:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
'use strict';

// FUNCTIONS //

var ln = Math.log;


// NORMAL TAIL //

/**
* FUNCTION dRanNormalTail( dMin, iNegative, rand )
*	Transform the tail of the normal distribution to
*	the unit interval and then use rejection technique
*	to generate standar normal variable.
*	Reference:
*		Marsaclia, G. (1964). Generating a Variable from the Tail
*		of the Normal Distribution. Technometrics, 6(1),
*		101–102. doi:10.1080/00401706.1964.10490150
*
* @param {Number} dMin - start value of the right tail
* @param {Boolean} iNegative - boolean indicating which side to evaluate
* @returns {Number} standard normal variable
*/
function dRanNormalTail( dMin, iNegative, rand ) {
	var x, y;
	do {
		x = ln( rand() ) / dMin;
		y = ln( rand() );
	} while ( -2 * y < x * x );
	return iNegative ? x - dMin : dMin - x;
} // end FUNCTION dRanNormalTail()


// EXPORTS //

module.exports = dRanNormalTail;

},{}],7:[function(require,module,exports){
'use strict';

// MODULES //

var dRanNormalTail = require( './dRanNormalTail.js' );


// FUNCTIONS //

var abs = Math.abs,
	exp = Math.exp,
	log = Math.log,
	pow = Math.pow,
	sqrt = Math.sqrt;


// CONSTANTS //

var TWO_P_32 = pow( 2, 32);


// GENERATE NORMAL RANDOM NUMBERS //

/**
* FUNCTION random( mu, sigma[, rand] )
*	Generates a random draw from a normal distribution
*	with parameters `mu` and `sigma`. Implementation
*	of the "Improved Ziggurat Method" by J. Doornik.
*	Reference:
*		Doornik, J. a. (2005).
*		An Improved Ziggurat Method to Generate Normal Random Samples.
*
* @param {Number} mu - mean parameter
* @param {Number} sigma - standard deviation
* @param {Function} [rand=Math.random] - random number generator
* @returns {Number} random draw from the specified distribution
*/
function random( mu, sigma, rand ) {

	if ( !rand ) {
		rand = Math.random;
	}

	var ZIGNOR_C = 128,/* number of blocks */
 		ZIGNOR_R = 3.442619855899, /* start of the right tail *
		/* (R * phi(R) + Pr(X>=R)) * sqrt(2\pi) */
		ZIGNOR_V = 9.91256303526217e-3,
		/* s_adZigX holds coordinates, such that each rectangle has
			same area; s_adZigR holds s_adZigX[i + 1] / s_adZigX[i] */
		s_adZigX = new Array( ZIGNOR_C + 1 ),
		s_adZigR = new Array( ZIGNOR_C ),
		i, f;

	f = exp( -0.5 * ZIGNOR_R * ZIGNOR_R );
	s_adZigX[0] = ZIGNOR_V / f; /* [0] is bottom block: V / f(R) */
	s_adZigX[1] = ZIGNOR_R;
	s_adZigX[ZIGNOR_C] = 0;
	for ( i = 2; i < ZIGNOR_C; i++ ) {
		s_adZigX[i] = sqrt( -2 * log( ZIGNOR_V / s_adZigX[i - 1] + f ) );
		f = exp( -0.5 * s_adZigX[i] * s_adZigX[i] );
	}
	for ( i = 0; i < ZIGNOR_C; i++ ) {
		s_adZigR[i] = s_adZigX[i + 1] / s_adZigX[i];
	}
	var x, u, f0, f1;
	for (;;) {
		u = 2 * rand() - 1;
		i = TWO_P_32 * rand() & 0x7F;
		/* first try the rectangular boxes */
		if ( abs(u) < s_adZigR[i] ) {
			return mu + sigma * u * s_adZigX[i];
		}
		/* bottom box: sample from the tail */
		if ( i === 0 ) {
			return mu + sigma * dRanNormalTail( ZIGNOR_R, u < 0, rand );
		}
		/* is this a sample from the wedges? */
		x = u * s_adZigX[i];
		f0 = exp( -0.5 * ( s_adZigX[i] * s_adZigX[i] - x * x ) );
		f1 = exp( -0.5 * ( s_adZigX[i+1] * s_adZigX[i+1] - x * x ) );
		if ( f1 + rand() * (f0 - f1) < 1.0 ) {
			return mu + sigma * x;
		}
	}
} // end FUNCTION random()


// EXPORTS //

module.exports = random;

},{"./dRanNormalTail.js":6}],8:[function(require,module,exports){
module.exports = function (w, h) {
	var canvas = document.createElement('canvas');

	if (w != null) canvas.width = w;
	if (h != null) canvas.height = h;

	return canvas;
};

},{}],9:[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(global, fn)
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":10}],10:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.7.1
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

}).call(this,require('_process'))
},{"_process":1}],11:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[2]);
