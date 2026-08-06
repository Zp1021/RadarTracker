import randomNoise from "../utils/Noise.js";

// Radar simulates a sensor that measures an aircraft's position
// with a configurable amount of measurement error.
export default class Radar {

    // maxNoise defines the maximum possible measurement error
    // in either the x or y direction.
    constructor(maxNoise) {
        this.maxNoise = maxNoise;
    }

    // Takes an aircraft object and returns a noisy measurement
    // of its current position.
    measure(aircraft) {

        // Store the aircraft's true position before adding sensor error
        const trueX = aircraft.x;
        const trueY = aircraft.y;

        // Generate random measurement errors within the radar's accuracy range
        // Example: maxNoise = 5 allows errors between -5 and +5
        const errorX = randomNoise(-this.maxNoise, this.maxNoise);
        const errorY = randomNoise(-this.maxNoise, this.maxNoise);

        // Apply measurement error to simulate an imperfect radar reading
        const measuredX = trueX + errorX;
        const measuredY = trueY + errorY;

        // Return the radar measurement separately from the aircraft's true position
        return {
            x: measuredX,
            y: measuredY
        };
    }
}
