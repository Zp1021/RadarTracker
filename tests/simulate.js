// Runs the same simulation as main.js, without drawing, so it can be tested.
import Aircraft from "../src/classes/Aircraft.js";
import Radar from "../src/classes/Radar.js";
import AlphaBetaFilter from "../src/classes/AlphaBetaFilter.js";
import KalmanFilter from "../src/classes/KalmanFilter.js";
import seededRandom from "./seededRandom.js";

// Same settings as main.js
export const MAX_NOISE = 5;
export const MEASUREMENT_VARIANCE = (MAX_NOISE ** 2) / 3;
const DT = 1;

// Updates 1 and 2 are start-up: one reading gives position, a second is needed for velocity
const WARM_UP = 2;
function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// One flight with one seed. Returns the average errors and consistency scores after warm-up.
export function runFlight(seed, steps = 20) {
    const aircraft = new Aircraft(100, 100, 50, 20);
    const radar = new Radar(MAX_NOISE, seededRandom(seed));
    const alphaBeta = new AlphaBetaFilter(0.5, 0.2);
    const kalmanX = new KalmanFilter(MEASUREMENT_VARIANCE);
    const kalmanY = new KalmanFilter(MEASUREMENT_VARIANCE);
    let radarError = 0, alphaBetaError = 0, kalmanError = 0, nees = 0, nis = 0, counted = 0;

    for (let step = 1; step <= steps; step++) {
        aircraft.update(DT);
        const truth = aircraft.getPosition();
        const measurement = radar.measure(aircraft);
        const ab = alphaBeta.update(measurement, DT);
        const kalman = { x: kalmanX.update(measurement.x, DT), y: kalmanY.update(measurement.y, DT) };
        if (step > WARM_UP) {
            radarError += distance(measurement, truth);
            alphaBetaError += distance(ab.position, truth);
            kalmanError += distance(kalman, truth);
            nees += kalmanX.nees(truth.x, aircraft.vx) + kalmanY.nees(truth.y, aircraft.vy);
            nis += kalmanX.nis() + kalmanY.nis();
            counted++;
        }
    }

    return {
        radar: radarError / counted,
        alphaBeta: alphaBetaError / counted,
        kalman: kalmanError / counted,
        nees: nees / counted,
        nis: nis / counted
    };
}

// Average and standard error of a list of numbers
function summary(values) {
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
    return { mean, standardError: Math.sqrt(variance / values.length) };
}

// Many flights with different seeds ("Monte Carlo"), averaged
export function runMonteCarlo(flights = 1000, steps = 20) {
    const runs = [];
    for (let seed = 1; seed <= flights; seed++) runs.push(runFlight(seed, steps));
    const result = {};
    for (const key of ["radar", "alphaBeta", "kalman", "nees", "nis"]) {
        result[key] = summary(runs.map(r => r[key]));
    }
    return result;
}