export default class Aircraft {

    // Information for aircraft
    constructor(x, y, vx, vy) {
        // Starting positions
        this.x = x;
        this.y = y;

        // Speed along each axis
        this.vx = vx;
        this.vy = vy;
    }

    // Updated positional info based on change over time
    update(dt){
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    // Return position information
    getPosition(){
        return {
            x: this.x,
            y: this.y
        };
    }

}