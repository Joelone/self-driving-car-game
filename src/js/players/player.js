var keys = require('../utils/utils.keysDown.js'),
    mathHelpers = require('../utils/utils.math.js');

/** Player Module
 * Main player entity module.
 */
function Player(scope, x, y, boundaries) {
    var player = this;

    // Create the initial state
    player.state = {
        position: {
            x: x,
            y: y,
            d: 0,
            speed: 0.0
        },
        moveSpeed: 0.25
    };

    // Set up any other constants
    var height = 23,
        width = 16;

    // Draw the player on the canvas
    player.render = () => {

        scope.context.strokeStyle = 'white';
        scope.context.lineWidth = '1';
        /* begin sensor suite*/

        for (let i = 0; i < 12; i++) {
            const angle = player.state.position.d + (360 / 12) * i;

            scope.context.beginPath();
            scope.context.fillStyle = 'red';
            scope.context.moveTo(player.state.position.x, player.state.position.y);
            scope.context.lineTo(player.state.position.x + player.xForDA(angle, 100), player.state.position.y + player.yForDA(angle, 100));
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
            player.state.position.d-=2;
        }
        if (keys.isPressed.ArrowRight) {
            player.state.position.d+=2;
        }
        if (keys.isPressed.ArrowUp) {
            player.state.position.speed += player.state.moveSpeed;
        }
        if (keys.isPressed.ArrowDown) {
            player.state.position.speed -= player.state.moveSpeed;
        }
    };

    player.update = () => {

        if (player.state.position.speed > 0) {
            player.state.position.speed -= 0.1;
        } else if (player.state.position.speed < 0) {
            player.state.position.speed += 0.1;
        }
        player.state.position.speed = player.state.position.speed.boundary(-1, 5);


        player.state.position.x = player.state.position.x + player.xForDA(player.state.position.d, player.state.position.speed);
        player.state.position.y = player.state.position.y + player.yForDA(player.state.position.d, player.state.position.speed);
        // Bind the player to the boundary
        player.state.position.x = player.state.position.x.boundary(0, (scope.constants.width - width));
        player.state.position.y = player.state.position.y.boundary(0, (scope.constants.height - height));


    };

    return player;
}

module.exports = Player;