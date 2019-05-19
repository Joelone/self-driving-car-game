var keys = require('../utils/utils.keysDown.js'),
    mathHelpers = require('../utils/utils.math.js');

/** Player Module
 * Main player entity module.
 */
function Boundary(scope, x, y) {
    var boundary = this;

    // Create the initial state
    boundary.state = {
        points: [
            [100, 100],
            [100, 200],
            [200, 200]
        ]
    };

    // Draw the player on the canvas
    boundary.render = () => {

        /* begin sensor suite*/

        for (let i=0;i<Math.max(0, boundary.state.points.length - 1); i++) {
            scope.context.beginPath();
            scope.context.strokeStyle = 'green';
            scope.context.lineWidth = '5';
            scope.context.moveTo(boundary.state.points[i][0], boundary.state.points[i][1]);
            scope.context.lineTo(boundary.state.points[i+1][0], boundary.state.points[i+1][1]);
            scope.context.stroke();
        }
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