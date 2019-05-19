
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

    marker.onInput = () => {};
    marker.update = () => {

    };
    marker.render = () => {

        scope.context.fillStyle = 'rgba(255,0,0,0.25)';
        scope.context.beginPath();
        scope.context.arc(marker.state.geometry.x, marker.state.geometry.y, marker.state.geometry.r, 0, 2 * Math.PI);
        scope.context.fill();
        scope.context.fillStyle = 'white';

        scope.context.fillText(marker.state.score, marker.state.geometry.x, marker.state.geometry.y);
    }
}

module.exports = Buoy;