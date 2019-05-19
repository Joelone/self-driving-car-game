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


var map = [[[47,133],[48,52],[108,34],[279,40],[464,35],[970,54],[1184,57],[1320,70],[1520,105],[1543,215],[1528,355],[1515,689],[1509,730],[1443,768],[1365,799],[1249,827],[1089,830],[1034,829],[978,828],[961,797],[953,788],[914,749],[884,698],[882,678],[884,663],[896,634],[919,622],[943,613],[971,608],[989,606],[1011,599],[1029,587],[1039,581],[1047,569],[1051,545],[1050,522],[1042,487],[1022,467],[991,451],[970,450],[926,449],[893,453],[862,463],[843,476],[808,500],[789,529],[758,579],[718,640],[706,663],[688,682],[645,694],[608,694],[525,700],[514,701],[466,703],[435,701],[423,698],[399,706],[384,724],[362,760],[336,779],[309,784],[259,790],[208,790],[186,789],[138,759],[63,516],[61,394],[46,118]],[[129,148],[170,139],[238,132],[281,130],[452,129],[638,137],[718,139],[827,139],[930,137],[1070,140],[1158,146],[1225,154],[1313,163],[1364,173],[1389,212],[1396,263],[1396,374],[1394,573],[1389,640],[1327,687],[1266,706],[1204,724],[1158,732],[1094,737],[1060,733],[1032,723],[1003,693],[1018,674],[1067,666],[1085,664],[1131,633],[1136,599],[1151,516],[1170,478],[1169,388],[1136,331],[1022,294],[872,305],[780,325],[721,432],[684,490],[639,547],[587,573],[516,592],[460,597],[347,598],[238,570],[212,503],[167,311],[147,233],[142,142]],[],[[204,704],[173,684],[172,657],[196,633],[231,627],[268,638],[279,669],[269,693],[218,706],[196,701]]];

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

    // load game map
    if (map.length) {
        map.forEach((boundary) => {

            let b = new boundaryEnt(this, 'white');
            boundaries.push(b);
            this.state.entities['boundary'+Math.random()] = (b);

            boundary.forEach((point) => {
                b.addPoint({x: point[0], y: point[1] });
            })
        });
    }


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
            boundaries[activeBoundary].addPoint({ x: evt.clientX, y: evt.clientY });
    }, false);


    this.state.entities.player = new playerEnt(this, 100, 100, () => {
        return {
            boundaries
        }
    });


    return this;
}

// Instantiate a new game in the global scope at 800px by 600px
window.game = new Game(1600, 900, 60, true);

module.exports = game;