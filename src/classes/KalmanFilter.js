// Kalman filter for one axis(x or y) of a target moving at a nearly constant velocity.
// It estimates two numbers, position and velocity, and keeps track of how unsure it is.
export default class KalmanFilter {
    constructor(measurementVariance, processNoise = 0) {
        // How noisy the radar is (variance of one measurement)
        this.measurementVariance = measurementVariance;

        // How much the velocity may change on its own between updates
        this.processNoise = processNoise;

        // Estimates are unknown until the first measurement arrives
        this.position = null;
        this.velocity = null;

        // Uncertainty (covariance): pp = position, vv = velocity, pv = how the two errors are linked
        this.pp = 0;
        this.pv = 0;
        this.vv = 0;

        // Latest surprise and its expected size, kept for the nis() check
        this.lastInnovation = 0;
        this.lastInnovationVariance = 1;
    }

    update(measurement, dt) {
        // First measurement: start at the reading, with no knowledge of speed
        if (this.position === null) {
            this.position = measurement;
            this.velocity = 0;
            this.pp = this.measurementVariance;
            this.pv = 0;
            this.vv = 10000;
            return this.position;
        }

        // PREDICT: distance = speed x time, and the uncertainty grows
        const q = this.processNoise;
        const predictedPosition = this.position + this.velocity * dt;
        const pp = this.pp + 2 * dt * this.pv + dt * dt * this.vv + q * dt ** 3 / 3;
        const pv = this.pv + dt * this.vv + q * dt * dt / 2;
        const vv = this.vv + q * dt;

        // CORRECT: compare the prediction with the radar reading
        const innovation = measurement - predictedPosition;
        const innovationVariance = pp + this.measurementVariance;

        // Kalman gain: how much of the surprise to accept for position and for velocity
        const gainPosition = pp / innovationVariance;
        const gainVelocity = pv / innovationVariance;

        this.position = predictedPosition + gainPosition * innovation;
        this.velocity = this.velocity + gainVelocity * innovation;

        // The uncertainty shrinks because the filter now knows more
        this.pp = (1 - gainPosition) * pp;
        this.pv = (1 - gainPosition) * pv;
        this.vv = vv - gainVelocity * pv;

        this.lastInnovation = innovation;
        this.lastInnovationVariance = innovationVariance;

        // Return the new best position estimate
        return this.position;
    }

    // Normalized innovation squared: was the latest surprise as big as expected? (averages 1 per axis)
    nis() {
        return this.lastInnovation ** 2 / this.lastInnovationVariance;
    }

    // Normalized estimation error squared: is the real error as big as the filter believes?
    // Needs the true position and velocity, which only a simulation has. (averages 2 per axis)
    nees(truePosition, trueVelocity) {
        const ep = this.position - truePosition;
        const ev = this.velocity - trueVelocity;
        const det = this.pp * this.vv - this.pv * this.pv;
        return (this.vv * ep * ep - 2 * this.pv * ep * ev + this.pp * ev * ev) / det;
    }
}