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