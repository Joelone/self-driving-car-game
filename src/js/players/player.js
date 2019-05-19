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

    // Draw the player on the canvas
    player.render = () => {

        scope.context.strokeStyle = 'white';
        scope.context.lineWidth = '1';

        /* begin sensor view*/

        for (let i = 0; i < sensors; i++) {
            const angle = player.state.position.d + (360 / sensors) * i;

            if (i == 6){

                scope.context.strokeStyle = 'red';
            }else{

                scope.context.strokeStyle = 'green';
            }

            scope.context.beginPath();
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