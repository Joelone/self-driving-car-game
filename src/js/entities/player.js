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