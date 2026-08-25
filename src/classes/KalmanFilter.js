export default class KalmanFilter {
    constructor(measurementVariance) {
        // Estimate starts at 0 to represent aircrafts unknown position
        this.estimate = 0;
        
        // Level of uncertainty in the estimate
        this.estimateVariance = 1;

        // Radar measurement uncertainty
        this.measurementVariance = measurementVariance;
    }

    update(measurement) {
        // Prediction for both estimate and variance
        const predictedEstimate = this.estimate;
        const predictedVariance = this.estimateVariance;

        // Kalman Gain; if higher trust measurement more, if lower trust prediction more
        const kalmanGain =
            predictedVariance /
            (predictedVariance + this.measurementVariance);

        // Correction based on predicted estimate and radar measurement
        this.estimate =
            predictedEstimate +
            kalmanGain * (measurement - predictedEstimate);

        // Update to variance based on new data
        this.estimateVariance =
            (1 - kalmanGain) * predictedVariance;

        // Return new best estimate
        return this.estimate;
    }
}