var keys = require('../utils/utils.keysDown.js'),
    mathHelpers = require('../utils/utils.math.js');

/** Player Module
 * Main player entity module.
 */
function Player(scope, x, y) {
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
    player.render = function playerRender() {


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


        scope.context.fillStyle = '#FF7300';


        scope.context.beginPath();
        scope.context.arc(player.state.position.x, player.state.position.y, 10, 0, 2 * Math.PI);
        scope.context.fill();


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

    // Fired via the global update method.
    // Mutates state as needed for proper rendering next state
    player.update = function playerUpdate() {
        // Check if keys are pressed, if so, update the players position.
        if (keys.isPressed.left) {
            player.state.position.d-=2;
        }

        if (keys.isPressed.right) {
            player.state.position.d+=2;
        }

        if (keys.isPressed.up) {
            player.state.position.speed += player.state.moveSpeed;
        }

        if (keys.isPressed.down) {
            player.state.position.speed -= player.state.moveSpeed;
        }
        // player.state.position.speed = player.state.position.speed.boundary(-5, 5);
    };

    return player;
}

module.exports = Player;