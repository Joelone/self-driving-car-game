// Modules
var gameLoop = require('./core/game.loop.js'),
    gameUpdate = require('./core/game.update.js'),
    gameRender = require('./core/game.render.js'),
    // Entities
    playerEnt = require('./entities/player.js'),
    boundaryEnt = require('./entities/boundary.js'),
    buoyEnt = require('./entities/buoy.js'),
    // Utilities
    cUtils = require('./utils/utils.canvas.js'); // require our canvas utils


// https://github.com/zonetti/snake-neural-network/blob/49be7c056c871d0c8ab06329fc189255d137db26/src/runner.js
// https://wagenaartje.github.io/neataptic/docs/neat/
function Game(w, h, viewport, targetFps, showFps) {
    var map = {"boundaries":[[[47,133],[48,52],[108,34],[279,40],[464,35],[970,54],[1184,57],[1320,70],[1520,105],[1543,215],[1528,355],[1515,689],[1509,730],[1443,768],[1365,799],[1249,827],[1089,830],[1034,829],[978,828],[961,797],[953,788],[914,749],[884,698],[882,678],[884,663],[896,634],[919,622],[943,613],[971,608],[989,606],[1011,599],[1029,587],[1039,581],[1047,569],[1051,545],[1050,522],[1042,487],[1022,467],[991,451],[970,450],[926,449],[893,453],[862,463],[843,476],[808,500],[789,529],[758,579],[718,640],[706,663],[688,682],[645,694],[608,694],[525,700],[514,701],[466,703],[435,701],[423,698],[399,706],[384,724],[362,760],[336,779],[309,784],[259,790],[208,790],[186,789],[138,759],[63,516],[61,394],[46,118]],[[129,148],[170,139],[238,132],[281,130],[452,129],[638,137],[718,139],[827,139],[930,137],[1070,140],[1158,146],[1225,154],[1313,163],[1364,173],[1389,212],[1396,263],[1396,374],[1394,573],[1389,640],[1327,687],[1266,706],[1204,724],[1158,732],[1094,737],[1060,733],[1032,723],[1003,693],[1018,674],[1067,666],[1085,664],[1131,633],[1136,599],[1151,516],[1170,478],[1169,388],[1136,331],[1022,294],[872,305],[780,325],[721,432],[684,490],[639,547],[587,573],[516,592],[460,597],[347,598],[238,570],[212,503],[167,311],[147,233],[142,142]],[],[[204,704],[173,684],[172,657],[196,633],[231,627],[268,638],[279,669],[269,693],[218,706],[196,701]]],"buoys":[[104,94,120,1],[182,88,120,2],[265,83,120,3],[353,87,120,4],[452,80,120,5],[529,83,120,6],[594,82,120,7],[660,83,120,8],[720,86,120,9],[848,88,120,10],[930,87,120,11],[1029,91,120,12],[1119,99,120,13],[1201,103,120,14],[1302,107,120,15],[1390,130,120,16],[1441,146,120,17],[1471,194,120,18],[1468,302,120,19],[1459,409,120,20],[1458,490,120,21],[1438,576,120,22],[1428,659,120,23],[1400,714,120,24],[1300,756,120,25],[1210,762,120,26],[1081,777,120,27],[985,765,120,28],[973,724,120,29],[983,644,120,30],[1058,616,120,31],[1105,540,120,32],[1091,446,120,33],[1030,389,120,34],[938,376,120,35],[849,385,120,36],[770,453,120,37],[734,522,120,38],[650,592,120,39],[533,642,120,40],[439,645,120,41],[350,660,120,42],[270,665,120,43],[212,662,120,44],[149,555,120,45],[129,480,120,46],[107,378,120,47],[107,270,120,48],[101,201,120,49]]};

    const placeMode = "buoy";

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
    this.viewport.id='viewport'+Math.random();

    // Get and store the canvas context as a global
    this.context = this.viewport.getContext('2d');

    this.container = document.getElementById(viewport);

    // Append viewport into our container within the dom
    this.container.insertBefore(this.viewport, this.container.firstChild);

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
            buoys: this.buoys
        }
    }, () => {
        console.log('GAME OVER');

    });


    return this;
}

// Instantiate a new game in the global scope at 800px by 600px
window.game = new Game(1600, 900, 'container', 60, true);
window.game2 = new Game(1600, 900, 'container2', 60, true);

console.log(window.game);
console.log(window.game2);

module.exports = [window.game, window.game2];