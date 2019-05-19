
function ProgressMarker() {
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
        market.state.score = s;
    };

    marker.isPointInside = (x, y) => {
        return Math.sqrt(Math.pow(Math.abs(marker.state.geometry.x - x), 2) + Math.pow(Math.abs(marker.state.geometry.y - y), 2) ) < marker.state.geometry.r;
    };
}

module.exports = ProgressMarker;