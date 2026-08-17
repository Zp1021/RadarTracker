export default class AlphaBetaFilter{

    constructor(alpha, beta){

        this.alpha = alpha;
        this.beta = beta;
        this.position = null;
        this.velocity = null;

    }

    update(measurement, dt){

        if(this.position === null){
            this.position = measurement;
            this.velocity = {
                x: 0,
                y: 0
            };
        } else {
            const predictedX = this.position.x + this.velocity.x * dt;
            const predictedY = this.position.y + this.velocity.y * dt;

            const residualX = measurement.x - predictedX;
            const residualY = measurement.y - predictedY;

            const positionCorrectionX = this.alpha * residualX;
            const positionCorrectionY = this.alpha * residualY;

            const correctedX = predictedX + positionCorrectionX;
            const correctedY = predictedY + positionCorrectionY;

            const velocityCorrectionX = (this.beta / dt) * residualX;
            const velocityCorrectionY = (this.beta / dt) * residualY;

            this.velocity.x += velocityCorrectionX;
            this.velocity.y += velocityCorrectionY;

            this.position = {
                x: correctedX,
                y: correctedY
            };
        }

        return {
            position: this.position,
            velocity: this.velocity
        };
        
    }
}