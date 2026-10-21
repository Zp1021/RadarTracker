export default class AlphaBetaFilter{

    // Store the filter's alpha and beta params with key position and velocity estimates
    constructor(alpha, beta){

        this.alpha = alpha;
        this.beta = beta;
        
        //This filter won't innately have position and velocity measurements, so on first initialization these measurements will be null
        this.position = null;
        this.velocity = null;

        // Becomes true once a second reading has given a velocity estimate
        this.velocityReady = false;

    }

    update(measurement, dt){

        // Upon first measurement a prediction cannot be made, so initial measurements are starting position at zero velocity
        if(this.position === null){
            
            // First measurement given
            this.position = measurement;
            
            // Starting velocity of first initialization
            this.velocity = {
                x: 0,
                y: 0
            };
        } else if (!this.velocityReady) {
            // Second measurement: estimate velocity from the first two readings
            // (two-point start) instead of assuming the aircraft is standing still
            this.velocity = {
                x: (measurement.x - this.position.x) / dt,
                y: (measurement.y - this.position.y) / dt
            };
            this.position = measurement;
            this.velocityReady = true;
        } else {
            // Prediction equation for X and Y based on estimated position and velocity
            const predictedX = this.position.x + this.velocity.x * dt;
            const predictedY = this.position.y + this.velocity.y * dt;

            // Residual equation based on the difference between the actual measurements and the predicted ones
            const residualX = measurement.x - predictedX;
            const residualY = measurement.y - predictedY;

            // The alpha determines the degree of position correction
            const positionCorrectionX = this.alpha * residualX;
            const positionCorrectionY = this.alpha * residualY;

            // Corrected prediction
            const correctedX = predictedX + positionCorrectionX;
            const correctedY = predictedY + positionCorrectionY;

            // The beta determines the degree of velocity correction
            const velocityCorrectionX = (this.beta / dt) * residualX;
            const velocityCorrectionY = (this.beta / dt) * residualY;

            // velocity value is then updated according to the velocity correction
            this.velocity.x += velocityCorrectionX;
            this.velocity.y += velocityCorrectionY;

            // Position values updated to corrected prediction values 
            this.position = {
                x: correctedX,
                y: correctedY
            };
        }

        // Return filters position and velocity estimates
        return {
            position: this.position,
            velocity: this.velocity
        };
        
    }
}