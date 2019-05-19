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