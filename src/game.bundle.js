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

        if (scope.alive === false){
            window.cancelAnimationFrame( loop.stopLoop );

            return;
        }

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


        if (scope.alive === false){
            return;
        }


        // Clear out the canvas
        scope.context.clearRect(0, 0, w, h);
        
        scope.context.font = '32px Arial';
        scope.context.fillStyle = '#fff';
        scope.context.fillText(scope.gameName, 5, 50);

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

        if (scope.alive === false){
            return;
        }
        var state = scope.state || {};

        // If there are entities, iterate through them and call their `update` methods
        if (state.hasOwnProperty('entities')) {
            var entities = state.entities;
            // Loop through entities
            for (var entity in entities) {
                // Fire off each active entities `render` method
                entities[entity].update();
            }
        }

        return state;
    }   
}

module.exports = gameUpdate;
},{}],4:[function(require,module,exports){
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
        boundary.state.points.push([evt.x, evt.y]);
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

    boundary.update = () => {

    };


    return boundary;
}

module.exports = Boundary;
},{}],5:[function(require,module,exports){

function Buoy(scope) {
    const marker = this;

    marker.state = {
        geometry: {
            x: 0,
            y: 0,
            r: 0
        },
        score: 0
    };

    marker.setMarkPoint = (x, y) => {
        marker.state.geometry.x = x;
        marker.state.geometry.y = y;
    };

    marker.setMarkRadius = (r) => {
        marker.state.geometry.r = r;
    };

    marker.setMarkScore = (s) => {
        marker.state.score = s;
    };

    marker.isPointInside = (x, y) => {
        return Math.sqrt(Math.pow(Math.abs(marker.state.geometry.x - x), 2) + Math.pow(Math.abs(marker.state.geometry.y - y), 2) ) < marker.state.geometry.r;
    };

    marker.update = () => { };
    marker.render = () => {

        // scope.context.fillStyle = 'rgba(255,0,0,0.25)';
        // scope.context.beginPath();
        // scope.context.arc(marker.state.geometry.x, marker.state.geometry.y, marker.state.geometry.r, 0, 2 * Math.PI);
        // scope.context.fill();
        // scope.context.fillStyle = 'white';
        //
        // scope.context.fillText(marker.state.score, marker.state.geometry.x, marker.state.geometry.y);
    }
}

module.exports = Buoy;
},{}],6:[function(require,module,exports){
var keys = require('../utils/utils.keysDown.js')(),
    intersection = require('../utils/utils.intersect');
require('../utils/utils.math')
/** Player Module
 * Main player entity module.
 */

function Player(scope, x, y, getObjects, gameOver) {
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
        moveSpeed: 0.25,
        score: 0,
        timeSinceLastScoreUpdate: Date.now()
    };

    // Set up any other constants
    var height = 23,
        width = 16;

    const sensors = 16;

    const threshold = 1;
    let lookDistances = [...Array(1024).keys()];
    var percentColors = [
        { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
        { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
        { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } }
     ];

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
    };



    // Draw the player on the canvas
    player.render = () => {

        scope.context.strokeStyle = 'white';
        scope.context.lineWidth = '1';
        /* begin sensor view*/
        // for (let i = 0; i < sensors; i++) {
        //     const angle = player.state.position.d + (360 / sensors) * i;
        //     scope.context.beginPath();
        //     scope.context.strokeStyle = getColorForPercentage(player.state.sensors[i] / 500);
        //     scope.context.moveTo(player.state.position.x, player.state.position.y);
        //     scope.context.lineTo(player.state.position.x + player.xForDA(angle, player.state.sensors[i]), player.state.position.y + player.yForDA(angle, player.state.sensors[i]));
        //     scope.context.stroke();
        // }


        // Draw player
        scope.context.fillStyle = '#FF7300';
        scope.context.beginPath();
        scope.context.arc(player.state.position.x, player.state.position.y, 10, 0, 2 * Math.PI);
        scope.context.fill();

        // Draw line so we can tell direction visually
        scope.context.strokeStyle = 'black';
        scope.context.beginPath();
        scope.context.moveTo(player.state.position.x + player.xForDA(player.state.position.d, 20), player.state.position.y + player.yForDA(player.state.position.d, 20));
        scope.context.lineTo(player.state.position.x + player.xForDA(player.state.position.d, -10), player.state.position.y + player.yForDA(player.state.position.d, -10));
        scope.context.stroke();
        scope.context.fillStyle = 'white';

        scope.context.fillText(player.state.score, player.state.position.x, player.state.position.y);

    };

    player.xForDA = (angle, distance) => {
        return (Math.cos(angle * Math.PI / 180) * distance);
    };

    player.yForDA = (angle, distance) => {
        return (Math.sin(angle * Math.PI / 180) * distance);
    };


    player.pointDistanceFormula = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(Math.abs(x1-x2), 2) + Math.pow(Math.abs(y1-y2), 2) );
    };

    player.update = () => {
        //detect game over
        const timeDelta = Math.abs(player.state.timeSinceLastScoreUpdate - Date.now());
        if (timeDelta > 6000) {
            return gameOver();
        }

        const objects = getObjects();

        //detect new scores
        objects.buoys.forEach((buoy) => {
            const intersectingBuoy = player.pointDistanceFormula(player.state.position.x, player.state.position.y, buoy.state.geometry.x, buoy.state.geometry.y) < buoy.state.geometry.r;
            if (intersectingBuoy && buoy.state.score == player.state.score + 1) {

                player.state.score = buoy.state.score; // winner!

                getObjects().brain.score = buoy.state.score;// feed score/fitness data to NN

                player.state.timeSinceLastScoreUpdate = Date.now();

                buoy.state.score = buoy.state.score + objects.buoys.length; // increment buoy score so we can loop infinitely
            }
        });

        // update lidar sensors
        for (let i = 0; i < sensors; i++) {
                const angle = player.state.position.d + (360 / sensors) * i;
                player.state.sensors[i] = Math.min(...objects.boundaries.map((boundary) => {
                    const distances = boundary.getSegments().map((segment) => {
                        function binarySearch(list) {
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
                                        player.state.position.x + player.xForDA(angle, list[middle]),
                                        player.state.position.y + player.yForDA(angle, list[middle]),
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
            if (player.state.sensors[0] > 16) {
                player.state.position.speed -= 0.1;
            } else {
                player.state.position.speed = 0;
            }
        } else if (player.state.position.speed < 0) {
            if (player.state.sensors[sensors / 2] > 16) {
                player.state.position.speed += 0.1;
            } else {
                player.state.position.speed = 0;
            }
        }
        player.state.position.speed = player.state.position.speed.boundary(-2, 12);
        if (player.state.position.speed > 0 && player.state.position.speed < 0.1) {
            player.state.position.speed = 0;
        }
        if (player.state.position.speed > -0.1 && player.state.position.speed < 0) {
            player.state.position.speed = 0;
        }
        player.state.position.x = player.state.position.x + player.xForDA(player.state.position.d, player.state.position.speed);
        player.state.position.y = player.state.position.y + player.yForDA(player.state.position.d, player.state.position.speed);
        player.state.position.x = player.state.position.x.boundary(0, (scope.constants.width - width));
        player.state.position.y = player.state.position.y.boundary(0, (scope.constants.height - height));



        // Generate neural network input
        const networkInput = [player.state.position.speed, ...player.state.sensors];

        const output = getObjects().brain.activate(networkInput).map(o => Math.round(o))

        // accept new game input from the NN
        if (output[0]) {
            player.state.position.d-=2.5;
        }
        if (output[1]) {
            player.state.position.d+=2.5;
        }
        if (output[2]) {
            player.state.position.speed += player.state.moveSpeed;
        }
        if (output[3]) {
            player.state.position.speed -= player.state.moveSpeed;
        }
    };

    return player;
}

module.exports = Player;
},{"../utils/utils.intersect":11,"../utils/utils.keysDown.js":12,"../utils/utils.math":13}],7:[function(require,module,exports){
// Modules
var gameLoop = require('./core/game.loop.js'),
    gameUpdate = require('./core/game.update.js'),
    gameRender = require('./core/game.render.js'),
    // Entities
    playerEnt = require('./entities/player.js'),
    boundaryEnt = require('./entities/boundary.js'),
    buoyEnt = require('./entities/buoy.js'),
    // Utilities
    cUtils = require('./utils/utils.canvas.js'),
    $container = document.getElementById('container'); // require our canvas utils


// https://github.com/zonetti/snake-neural-network/blob/49be7c056c871d0c8ab06329fc189255d137db26/src/runner.js
// https://wagenaartje.github.io/neataptic/docs/neat/
function Game(w, h, gameOver, brain, targetFps, showFps) {
    var map = {"boundaries":[[[47,133],[48,52],[108,34],[279,40],[464,35],[970,54],[1184,57],[1320,70],[1520,105],[1543,215],[1528,355],[1515,689],[1509,730],[1443,768],[1365,799],[1249,827],[1089,830],[1034,829],[978,828],[961,797],[953,788],[914,749],[884,698],[882,678],[884,663],[896,634],[919,622],[943,613],[971,608],[989,606],[1011,599],[1029,587],[1039,581],[1047,569],[1051,545],[1050,522],[1042,487],[1022,467],[991,451],[970,450],[926,449],[893,453],[862,463],[843,476],[808,500],[789,529],[758,579],[718,640],[706,663],[688,682],[645,694],[608,694],[525,700],[514,701],[466,703],[435,701],[423,698],[399,706],[384,724],[362,760],[336,779],[309,784],[259,790],[208,790],[186,789],[138,759],[63,516],[61,394],[46,118]],[[129,148],[170,139],[238,132],[281,130],[452,129],[638,137],[718,139],[827,139],[930,137],[1070,140],[1158,146],[1225,154],[1313,163],[1364,173],[1389,212],[1396,263],[1396,374],[1394,573],[1389,640],[1327,687],[1266,706],[1204,724],[1158,732],[1094,737],[1060,733],[1032,723],[1003,693],[1018,674],[1067,666],[1085,664],[1131,633],[1136,599],[1151,516],[1170,478],[1169,388],[1136,331],[1022,294],[872,305],[780,325],[721,432],[684,490],[639,547],[587,573],[516,592],[460,597],[347,598],[238,570],[212,503],[167,311],[147,233],[142,142]],[],[[204,704],[173,684],[172,657],[196,633],[231,627],[268,638],[279,669],[269,693],[218,706],[196,701]]],"buoys":[[104,94,120,1],[182,88,120,2],[265,83,120,3],[353,87,120,4],[452,80,120,5],[529,83,120,6],[594,82,120,7],[660,83,120,8],[720,86,120,9],[848,88,120,10],[930,87,120,11],[1029,91,120,12],[1119,99,120,13],[1201,103,120,14],[1302,107,120,15],[1390,130,120,16],[1441,146,120,17],[1471,194,120,18],[1468,302,120,19],[1459,409,120,20],[1458,490,120,21],[1438,576,120,22],[1428,659,120,23],[1400,714,120,24],[1300,756,120,25],[1210,762,120,26],[1081,777,120,27],[985,765,120,28],[973,724,120,29],[983,644,120,30],[1058,616,120,31],[1105,540,120,32],[1091,446,120,33],[1030,389,120,34],[938,376,120,35],[849,385,120,36],[770,453,120,37],[734,522,120,38],[650,592,120,39],[533,642,120,40],[439,645,120,41],[350,660,120,42],[270,665,120,43],[212,662,120,44],[149,555,120,45],[129,480,120,46],[107,378,120,47],[107,270,120,48],[101,201,120,49]]};

    const placeMode = "buoy";

    // Setup some constants
    this.constants = {
        width: w,
        height: h,
        targetFps: targetFps,
        showFps: showFps
    };
    this.brain = brain;
    this.alive = true;

    this.gameName = 'GAME'+Math.random();

    // Instantiate an empty state object
    this.state = {};

  // Generate a canvas and store it as our viewport
    this.viewport = cUtils.generateCanvas(w, h);
    this.viewport.id='viewport'+Math.random();

    // Get and store the canvas context as a global
    this.context = this.viewport.getContext('2d');

    // Append viewport into our container within the dom
    $container.insertBefore(this.viewport, $container.firstChild);

    // Instantiate core modules with the current scope
    this.update = gameUpdate( this );
    this.render = gameRender( this );
    this.loop = new gameLoop( this );

    this.state.entities = this.state.entities || {};

    this.activeBoundary = 0;
    this.boundaries = [ ];
    this.buoys = [ ];

    // load game map
    if (map) {
        map.boundaries.forEach((boundary) => {
            let b = new boundaryEnt(this, 'white');
            this.boundaries.push(b);
            this.state.entities['boundary'+Math.random()] = (b);
            boundary.forEach((point) => {
                b.addPoint({x: point[0], y: point[1] });
            })
        });
        map.buoys.forEach((buoy) => {
            let b = new buoyEnt(this, 'white');
            b.setMarkPoint(buoy[0], buoy[1]);
            b.setMarkRadius(buoy[2]);
            b.setMarkScore(buoy[3]);
            this.buoys.push(b);
            this.state.entities['buoy'+Math.random()] = (b);
        });
    }


    require('./utils/utils.keysDown')((e) => {

        if (map){
            return;
        }
        if (e.KeyT) {
            const output = {
                boundaries: [],
                buoys: []
            };
            this.boundaries.forEach((boundary) => {
                output.boundaries.push(boundary.state.points)
            });
            this.buoys.forEach((buoy) => {
                output.buoys.push([buoy.state.geometry.x, buoy.state.geometry.y, buoy.state.geometry.r, buoy.state.score]);
            });
            console.log(JSON.stringify(output));
        }



        if (placeMode === 'boundary') {

            if (e.KeyS) {
                this.activeBoundary += 1;
                if (this.activeBoundary > this.boundaries.length - 1) {
                    this.activeBoundary = this.boundaries.length - 1;
                }
            }
            if (e.KeyA) {
                this.activeBoundary -= 1;
                if (this.activeBoundary < 0) {
                    this.activeBoundary = 0;
                }
            }

            if (e.KeyN) {
                let b = new boundaryEnt(this, 'white');
                this.boundaries.push(b);
                this.state.entities['boundary' + Math.random()] = (b);
            }
            if (e.KeyZ) {
                this.boundaries[activeBoundary].removeNewest();
            }
        }

        if (placeMode === 'buoy') {

            if (e.KeyZ) {
                this.bouys.pop();
                currentBuoyScore--;

            }
        }

    });

    let currentBuoyScore = 1;
    this.viewport.addEventListener("mousedown", (evt) => {
        if (map){
            return;
        }
        if (placeMode === 'boundary') {
            if (this.boundaries[this.activeBoundary])
                this.boundaries[this.activeBoundary].addPoint({x: evt.clientX, y: evt.clientY});
        }
        if (placeMode === 'buoy') {
            let b = new buoyEnt(this, 'red');
            b.setMarkPoint(evt.clientX, evt.clientY);
            b.setMarkRadius(120);
            b.setMarkScore(this.currentBuoyScore);
            // b.setMarkRadius(parseInt(prompt('Radius?', 60)));
            // b.setMarkScore(parseInt(prompt('Score Value', currentBuoyScore)));
            this.currentBuoyScore++;
            this.buoys.push(b);
            this.state.entities['buoy' + Math.random()] = (b);
        }
    }, false);


    this.state.entities.player = new playerEnt(this, 100, 100, () => {
        return {
            boundaries: this.boundaries,
            buoys: this.buoys,
            brain: this.brain
        }
    }, () => {
        console.log('GAME OVER');
        gameOver();
        this.destruct();
    });


    this.destruct = () => {
        this.alive = false;
        this.viewport.parentNode.removeChild(this.viewport);
    };


    return this;
}

// Instantiate a new game in the global scope at 800px by 600px
// new Game(1600, 900, 60, true);

module.exports = Game;
},{"./core/game.loop.js":1,"./core/game.render.js":2,"./core/game.update.js":3,"./entities/boundary.js":4,"./entities/buoy.js":5,"./entities/player.js":6,"./utils/utils.canvas.js":10,"./utils/utils.keysDown":12}],8:[function(require,module,exports){

var NeuralNetworkTrainer = require('./neuralnetworktrainer')
// game settings

const GAMES = 15
const GAME_SIZE = 100
const GAME_UNIT = 5
const FRAME_RATE = 45

// game bottlenecks

const LOWEST_SCORE_ALLOWED = 0

// neural network settings

const MUTATION_RATE = 0.5
const MUTATION_AMOUNT = 3
const ELITISM = Math.round(0.2 * GAMES)


const Neat = neataptic.Neat;
const Config = neataptic.Config;

Config.warnings = false;

const neat = new Neat(17, 4, null, {
        popsize: GAMES,
        elitism: ELITISM,
        mutationRate: MUTATION_RATE,
        mutationAmount: MUTATION_AMOUNT
    }
);


let highestScore = 0

const runner = new NeuralNetworkTrainer({
    neat,
    games: GAMES,
    gameSize: GAME_SIZE,
    gameUnit:  GAME_UNIT,
    frameRate: FRAME_RATE,
    lowestScoreAllowed: LOWEST_SCORE_ALLOWED,
    onEndGeneration: ({generation, max}) => {

        if (max > highestScore) {
            highestScore = max
        }

        document.getElementById('generation').innerHTML = generation
        document.getElementById('highest-score').innerHTML = highestScore
    }
})

runner.startGeneration()

},{"./neuralnetworktrainer":9}],9:[function(require,module,exports){
var Game = require('./game');


class NeuralNetworkTrainer{

    constructor ({neat, games, gameSize, gameUnit, frameRate, lowestScoreAllowed, onEndGeneration}) {
        this.neat = neat
        this.games = []
        this.numGames = games;
        this.gamesFinished = 0
        this.onEndGeneration = onEndGeneration;

    }

    startGeneration () {
        this.gamesFinished = 0

        for (let i = 0; i < this.numGames; i++) {
            var brain = this.neat.population[i];
            this.games[i] = new Game(1600, 900, () => this.endGeneration(), brain, 30, true);
        }
    }

    endGeneration () {
        if (this.gamesFinished + 1 < this.games.length) {
            this.gamesFinished++
            return
        }

        this.neat.sort()

        this.onEndGeneration({
            generation: this.neat.generation,
            max: this.neat.getFittest().score
        })

        const newGeneration = []

        for (let i = 0; i < this.neat.elitism; i++) {
            newGeneration.push(this.neat.population[i])
        }

        for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            newGeneration.push(this.neat.getOffspring())
        }

        this.neat.population = newGeneration
        this.neat.mutate()
        this.neat.generation++
        this.startGeneration()
    }

}

module.exports = NeuralNetworkTrainer;
},{"./game":7}],10:[function(require,module,exports){
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
        canvas.className = 'viewport';
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
},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{}]},{},[8]);
