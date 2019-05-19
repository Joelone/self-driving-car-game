'use strict';

module.exports = (a,b,c,d,p,q,r,s) => {
    let det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return ((-0.01 < lambda && lambda < 1.01) && (-0.01 < gamma && gamma < 1.01));
    }
};
