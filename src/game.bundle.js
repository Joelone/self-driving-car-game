(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/** Game Loop Module
 * This module contains the game loop, which handles
 * updating the game state and re-rendering the canvas
 * (using the updated state) at the configured FPS.
 */
function gameLoop ( scope ) {
    var loop = this;

    // Initialize timer variables so we can calculate FPS
    var fps = scope.constants.targetFps,
        fpsInterval = 1000 / fps,
        before = window.performance.now(),
        // Set up an object to contain our alternating FPS calculations
        cycles = {
            new: {
                frameCount: 0,
                startTime: before,
                sinceStart: 0
            },
            old: {
                frameCount: 0,
                startTime: before,
                sineStart: 0
            }
        },
        // Alternating Frame Rate vars
        resetInterval = 5,
        resetState = 'new';

    loop.fps = 0;

    // Main game rendering loop
    loop.main = function mainLoop( tframe ) {
        // Request a new Animation Frame
        // setting to `stopLoop` so animation can be stopped via
        // `window.cancelAnimationFrame( loop.stopLoop )`
        loop.stopLoop = window.requestAnimationFrame( loop.main );

        // How long ago since last loop?
        var now = tframe,
            elapsed = now - before,
            activeCycle, targetResetInterval;

        // If it's been at least our desired interval, render
        if (elapsed > fpsInterval) {
            // Set before = now for next frame, also adjust for 
            // specified fpsInterval not being a multiple of rAF's interval (16.7ms)
            // ( http://stackoverflow.com/a/19772220 )
            before = now - (elapsed % fpsInterval);

            // Increment the vals for both the active and the alternate FPS calculations
            for (var calc in cycles) {
                ++cycles[calc].frameCount;
                cycles[calc].sinceStart = now - cycles[calc].startTime;
            }

            // Choose the correct FPS calculation, then update the exposed fps value
            activeCycle = cycles[resetState];
            loop.fps = Math.round(1000 / (activeCycle.sinceStart / activeCycle.frameCount) * 100) / 100;

            // If our frame counts are equal....
            targetResetInterval = (cycles.new.frameCount === cycles.old.frameCount 
                                   ? resetInterval * fps // Wait our interval
                                   : (resetInterval * 2) * fps); // Wait double our interval

            // If the active calculation goes over our specified interval,
            // reset it to 0 and flag our alternate calculation to be active
            // for the next series of animations.
            if (activeCycle.frameCount > targetResetInterval) {
                cycles[resetState].frameCount = 0;
                cycles[resetState].startTime = now;
                cycles[resetState].sinceStart = 0;

                resetState = (resetState === 'new' ? 'old' : 'new');
            }

            // Update the game state
            scope.state = scope.update( now );
            // Render the next frame
            scope.render();
        }
    };

    // Start off main loop
    loop.main();

    return loop;
}

module.exports = gameLoop;
},{}],2:[function(require,module,exports){
/** Game Render Module
 * Called by the game loop, this module will
 * perform use the global state to re-render
 * the canvas using new data. Additionally,
 * it will call all game entities `render`
 * methods.
 */
function gameRender( scope ) {
    // Setup globals
    var w = scope.constants.width,
        h = scope.constants.height;

    return function render() {
        // Clear out the canvas
        scope.context.clearRect(0, 0, w, h);
        
        // // Spit out some text
        // scope.context.font = '32px Arial';
        // scope.context.fillStyle = '#fff';
        // scope.context.fillText('It\'s dangerous to travel this route alone.', 5, 50);

        // // If we want to show the FPS, then render it in the top right corner.
        // if (scope.constants.showFps) {
        //     scope.context.fillStyle = '#ff0';
        //     scope.context.fillText(scope.loop.fps, w - 100, 50);
        // }

        // If there are entities, iterate through them and call their `render` methods
        if (scope.state.hasOwnProperty('entities')) {
            var entities = scope.state.entities;
            // Loop through entities
            for (var entity in entities) {
                // Fire off each active entities `render` method
                entities[entity].render();
            }
        }
    }
}

module.exports = gameRender;
},{}],3:[function(require,module,exports){
/** Game Update Module
 * Called by the game loop, this module will
 * perform any state calculations / updates
 * to properly render the next frame.
 */
function gameUpdate ( scope ) {
    return function update( tFrame ) {
        var state = scope.state || {};

        // If there are entities, iterate through them and call their `update` methods
        if (state.hasOwnProperty('entities')) {
            var entities = state.entities;
            // Loop through entities
            for (var entity in entities) {
                // Fire off each active entities `render` method
                entities[entity].onInput();

                entities[entity].update();
            }
        }

        return state;
    }   
}

module.exports = gameUpdate;
},{}],4:[function(require,module,exports){
// Modules
var gameLoop = require('./core/game.loop.js'),
    gameUpdate = require('./core/game.update.js'),
    gameRender = require('./core/game.render.js'),
    // Entities
    playerEnt = require('./players/player.js'),
    boundaryEnt = require('./players/boundary.js'),
    // Utilities
    cUtils = require('./utils/utils.canvas.js'), // require our canvas utils
    $container = document.getElementById('container');


// https://github.com/zonetti/snake-neural-network/blob/49be7c056c871d0c8ab06329fc189255d137db26/src/runner.js
// https://wagenaartje.github.io/neataptic/docs/neat/
function Game(w, h, targetFps, showFps) {
    var that;

    // Setup some constants
    this.constants = {
        width: w,
        height: h,
        targetFps: targetFps,
        showFps: showFps
    };

    // Instantiate an empty state object
    this.state = {};

  // Generate a canvas and store it as our viewport
    this.viewport = cUtils.generateCanvas(w, h);



    this.viewport.id = "gameViewport";

    // Get and store the canvas context as a global
    this.context = this.viewport.getContext('2d');

    // Append viewport into our container within the dom
    $container.insertBefore(this.viewport, $container.firstChild);

    // Instantiate core modules with the current scope
    this.update = gameUpdate( this );
    this.render = gameRender( this );
    this.loop = gameLoop( this );

    this.state.entities = this.state.entities || {};

    var activeBoundary = 0;
    var boundaries = [ ];

    require('./utils/utils.keysDown')((e) => {
        if (e.KeyS) {
            activeBoundary +=1;
            if (activeBoundary > boundaries.length-1) {
                activeBoundary = boundaries.length-1 ;
            }
        }
        if (e.KeyA) {
            activeBoundary -=1;
            if (activeBoundary < 0) {
                activeBoundary = 0;
            }
        }

        if (e.KeyN) {
            let b = new boundaryEnt(this, 'white');
            boundaries.push(b);
            this.state.entities['boundary'+Math.random()] = (b);
        }
        if (e.KeyZ) {
            boundaries[activeBoundary].removeNewest();
        }
        if (e.KeyT) {
            // print out for reloading via stdin
            console.log('attt');
            const output = [];
            boundaries.forEach((boundary) => {
                output.push(boundary.state.points)
            });
            console.log(JSON.stringify(output));
        }
    });

    this.viewport.addEventListener("mousedown", (evt) => {
        if (boundaries[activeBoundary])
            boundaries[activeBoundary].addPoint(evt);
    }, false);


    this.state.entities.player = new playerEnt(this, 100, 100, () => {
        return {
            boundaries
        }
    });


    return this;
}

// Instantiate a new game in the global scope at 800px by 600px
window.game = new Game(800, 600, 60, true);

module.exports = game;
},{"./core/game.loop.js":1,"./core/game.render.js":2,"./core/game.update.js":3,"./players/boundary.js":5,"./players/player.js":6,"./utils/utils.canvas.js":7,"./utils/utils.keysDown":9}],5:[function(require,module,exports){
/** Player Module
 * Main player entity module.
 */
function Boundary(scope, color) {
    var boundary = this;

    boundary.segments = [];
    // Create the initial state
    boundary.state = {
        points: [
        ],
        dirty: false
    };

    // Draw the player on the canvas
    boundary.render = () => {

        /* begin sensor suite*/

        boundary.segments.forEach((segment) => {

            scope.context.beginPath();
            scope.context.strokeStyle = color;
            scope.context.fillStyle = 'red';
            scope.context.lineWidth = '6';
            scope.context.moveTo(segment[0][0], segment[0][1]);
            scope.context.lineTo(segment[1][0], segment[1][1]);
            scope.context.stroke();
        });
    };

    boundary.getSegments = () => {
        if (!boundary.state.dirty) {
            return boundary.segments;
        }
        const segments = [];
        for (let i=0;i<Math.max(0, boundary.state.points.length - 1); i++) {
            segments.push([
                [boundary.state.points[i][0], boundary.state.points[i][1]],
                [boundary.state.points[i+1][0], boundary.state.points[i+1][1]]
            ]);
        }
        boundary.segments = segments;
        boundary.state.isDirty = false;
        return segments;
    };

    boundary.addPoint = (evt) => {
        boundary.state.points.push([evt.clientX, evt.clientY]);
        boundary.state.dirty = true;
    };
    boundary.removeNewest = (evt) => {
        boundary.state.points.pop();
        boundary.state.dirty = true;
    };

    boundary.xForDA = (angle, distance) => {
        return (Math.cos(angle * Math.PI / 180) * distance);
    };

    boundary.yForDA = (angle, distance) => {
        return (Math.sin(angle * Math.PI / 180) * distance);
    };

    boundary.onInput = () => {

    };

    boundary.update = () => {

    };


    return boundary;
}

module.exports = Boundary;
},{}],6:[function(require,module,exports){
var keys = require('../utils/utils.keysDown.js')(),
    intersection = require('../utils/utils.intersect');
require('../utils/utils.math')
/** Player Module
 * Main player entity module.
 */
function Player(scope, x, y, getObjects) {
    var player = this;

    // Create the initial state
    player.state = {
        position: {
            x: x,
            y: y,
            d: 0,
            speed: 0.0
        },
        sensors: [],
        moveSpeed: 0.25
    };

    // Set up any other constants
    var height = 23,
        width = 16;

    const sensors = 16;

    const threshold = 1;
    let lookDistances = [...Array(500/threshold).keys()];
    var percentColors = [
        { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
        { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
        { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ];

    var getColorForPercentage = function(pct) {
        for (var i = 1; i < percentColors.length - 1; i++) {
            if (pct < percentColors[i].pct) {
                break;
            }
        }
        var lower = percentColors[i - 1];
        var upper = percentColors[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        // or output as hex if preferred
    }



    // Draw the player on the canvas
    player.render = () => {

        scope.context.strokeStyle = 'white';
        scope.context.lineWidth = '1';

        /* begin sensor view*/

        for (let i = 0; i < sensors; i++) {
            const angle = player.state.position.d + (360 / sensors) * i;

            scope.context.beginPath();
            if (i == 0) {
                console.log(getColorForPercentage(player.state.sensors[i] / 500))
            }
            scope.context.strokeStyle = getColorForPercentage(player.state.sensors[i] / 500);
            scope.context.moveTo(player.state.position.x, player.state.position.y);
            scope.context.lineTo(player.state.position.x + player.xForDA(angle, player.state.sensors[i]), player.state.position.y + player.yForDA(angle, player.state.sensors[i]));
            scope.context.stroke();
        }



        scope.context.fillStyle = '#FF7300';

        scope.context.beginPath();
        scope.context.arc(player.state.position.x, player.state.position.y, 10, 0, 2 * Math.PI);
        scope.context.fill();

        scope.context.strokeStyle = 'black';

        scope.context.beginPath();
        scope.context.moveTo(player.state.position.x + player.xForDA(player.state.position.d, 20), player.state.position.y + player.yForDA(player.state.position.d, 20));
        scope.context.lineTo(player.state.position.x + player.xForDA(player.state.position.d, -10), player.state.position.y + player.yForDA(player.state.position.d, -10));
        scope.context.stroke();



    };

    player.xForDA = (angle, distance) => {
        return (Math.cos(angle * Math.PI / 180) * distance);
    };

    player.yForDA = (angle, distance) => {
        return (Math.sin(angle * Math.PI / 180) * distance);
    };

    player.onInput = () => {

        if (keys.isPressed.ArrowLeft) {
            player.state.position.d-=2.5;
        }
        if (keys.isPressed.ArrowRight) {
            player.state.position.d+=2.5;
        }
        if (keys.isPressed.ArrowUp) {
            player.state.position.speed += player.state.moveSpeed;
        }
        if (keys.isPressed.ArrowDown) {
            player.state.position.speed -= player.state.moveSpeed;
        }
    };

    player.update = () => {

        // update lidar sensors

        for (let i = 0; i < sensors; i++) {
            const angle = player.state.position.d + (360 / sensors) * i;
            const objects = getObjects();
            player.state.sensors[i] = Math.min(...objects.boundaries.map((boundary) => {
                const distances = boundary.getSegments().map((segment) => {
                    function binarySearch (list) {
                        // initial values for start, middle and end
                        let start = 0;
                        let stop = list.length - 1;
                        let middle = Math.floor((start + stop) / 2);
                        function edgeScan() {
                            const output = [
                                intersection(
                                    player.state.position.x,
                                    player.state.position.y,
                                    player.state.position.x + player.xForDA(angle, list[middle]),
                                    player.state.position.y + player.yForDA(angle, list[middle]),
                                    segment[0][0],
                                    segment[0][1],
                                    segment[1][0],
                                    segment[1][1]
                                ),
                                intersection(
                                    player.state.position.x,
                                    player.state.position.y,
                                    player.state.position.x + player.xForDA(angle, list[middle] ),
                                    player.state.position.y + player.yForDA(angle, list[middle] ),
                                    segment[0][0],
                                    segment[0][1],
                                    segment[1][0],
                                    segment[1][1]
                                ),
                            ];

                            if (!output[0] && !output[1]) {
                                return -1;
                            }
                            if (!output[0] && output[1]) {
                                return 0;
                            }
                            if (output[0]) {
                                return 1;
                            }
                        }
                        for (var e; e = edgeScan(), e !== 0 && start < stop; middle = Math.floor((start + stop) / 2)) {
                            if (e === 1) {
                                stop = middle - 1
                            } else if (e == -1) {
                                start = middle + 1
                            }
                        }

                        // if the current middle item is what we're looking for return it's index, else return -1
                        return list[middle]
                    }
                    const distance = binarySearch(lookDistances);
                    return distance * threshold;
                });
                return Math.min(...distances);
            }));
        }


        // update vehicle movement

        if (player.state.position.speed > 0) {

            if (player.state.sensors[0] > 13) {

                player.state.position.speed -= 0.1;
            }else {
                player.state.position.speed = 0;
            }

        } else if (player.state.position.speed < 0) {


            if (player.state.sensors[sensors/2] > 10) {

                player.state.position.speed += 0.1;
            }else {
                player.state.position.speed = 0;
            }

            // player.state.position.speed += 0.1;
        }

        player.state.position.speed = player.state.position.speed.boundary(-2, 12);

        if (player.state.position.speed > 0 && player.state.position.speed < 0.1){
            player.state.position.speed = 0;
        }

        if (player.state.position.speed > -0.1 && player.state.position.speed < 0){
            player.state.position.speed = 0;
        }


        player.state.position.x = player.state.position.x + player.xForDA(player.state.position.d, player.state.position.speed);
        player.state.position.y = player.state.position.y + player.yForDA(player.state.position.d, player.state.position.speed);
        // Bind the player to the boundary
        player.state.position.x = player.state.position.x.boundary(0, (scope.constants.width - width));
        player.state.position.y = player.state.position.y.boundary(0, (scope.constants.height - height));


    };

    return player;
}

module.exports = Player;
},{"../utils/utils.intersect":8,"../utils/utils.keysDown.js":9,"../utils/utils.math":10}],7:[function(require,module,exports){
module.exports = {
    /** Determine the proper pixel ratio for the canvas */
    getPixelRatio : function getPixelRatio(context) {
      console.log('Determining pixel ratio.');
      var backingStores = [
        'webkitBackingStorePixelRatio',
        'mozBackingStorePixelRatio',
        'msBackingStorePixelRatio',
        'oBackingStorePixelRatio',
        'backingStorePixelRatio'
      ];

      var deviceRatio = window.devicePixelRatio;

      // Iterate through our backing store props and determine the proper backing ratio.
      var backingRatio = backingStores.reduce(function(prev, curr) {
        return (context.hasOwnProperty(curr) ? context[curr] : 1);
      });

      // Return the proper pixel ratio by dividing the device ratio by the backing ratio
      return deviceRatio / backingRatio;
    },

    /** Generate a canvas with the proper width / height
     * Based on: http://www.html5rocks.com/en/tutorials/canvas/hidpi/
     */
    generateCanvas : function generateCanvas(w, h) {
      console.log('Generating canvas.');

      var canvas = document.createElement('canvas'),
          context = canvas.getContext('2d');
      // Pass our canvas' context to our getPixelRatio method
      var ratio = this.getPixelRatio(context);

      // Set the canvas' width then downscale via CSS
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      canvas.style.width = w +'px';
      canvas.style.height = h +'px';
      // Scale the context so we get accurate pixel density
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      return canvas;
    }
};
},{}],8:[function(require,module,exports){
'use strict';

module.exports = (a,b,c,d,p,q,r,s) => {
    let det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return ((-0.01 < lambda && lambda < 1.01) && (-0.01 < gamma && gamma < 1.01));
    }
};

},{}],9:[function(require,module,exports){
/** keysDown Utility Module
 * Monitors and determines whether a key 
 * is pressed down at any given moment.
 * Returns getters for each key.
 */
function keysDown(onDown, onUp) {
    this.isPressed = {};

    const _isPressed = {};

    const watchedKeys = [
        'ArrowUp',
        'ArrowLeft',
        'ArrowDown',
        'ArrowRight',
        'KeyA',
        'KeyZ',
        'KeyS',
        'KeyX'
    ];


    document.addEventListener('keydown', (ev) => {
        _isPressed[ev.code] = true;
        onDown ? onDown(_isPressed) : null;
    });


    document.addEventListener('keyup', (ev) => {
        _isPressed[ev.code] = false;
        onUp ? onUp(_isPressed) : null;
    });

    // // Set up `onkeyup` event handler.
    // document.onkeyup = function (ev) {
    //     _isPressed[ev.code] = false;
    // };

    // Define getters for each key
    // * Not strictly necessary. Could just return
    // * an object literal of methods, the syntactic
    // * sugar of `defineProperty` is just so much sweeter :)

    watchedKeys.forEach((key) => {
        Object.defineProperty(this.isPressed, key, {
            get: () => { return _isPressed[key]; },
            configurable: true,
            enumerable: true
        });

    });

    return this;
}

module.exports = keysDown;
},{}],10:[function(require,module,exports){
/** 
 * Number.prototype.boundary
 * Binds a number between a minimum and a maximum amount.
 * var x = 12 * 3;
 * var y = x.boundary(3, 23);
 * y === 23
 */

var Boundary = function numberBoundary(min, max) {
    return Math.min( Math.max(this, min), max );
};

// Expose methods
Number.prototype.boundary = Boundary;
module.exports = Boundary;
},{}]},{},[4]);
