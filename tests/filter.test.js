import { test } from "node:test";
import assert from "node:assert/strict";
import Aircraft from "../src/classes/Aircraft.js";
import Radar from "../src/classes/Radar.js";
import AlphaBetaFilter from "../src/classes/AlphaBetaFilter.js";
import KalmanFilter from "../src/classes/KalmanFilter.js";
import seededRandom from "./seededRandom.js";
import { runMonteCarlo, MAX_NOISE } from "./simulate.js";

test("aircraft moves by velocity times time", () => {
    const aircraft = new Aircraft(100, 100, 50, 20);
    aircraft.update(2);
    assert.deepEqual(aircraft.getPosition(), { x: 200, y: 140 });
});

test("radar error stays within the noise limit", () => {
    const aircraft = new Aircraft(0, 0, 0, 0);
    const radar = new Radar(MAX_NOISE, seededRandom(7));
    for (let i = 0; i < 1000; i++) {
        const m = radar.measure(aircraft);
        assert.ok(Math.abs(m.x) <= MAX_NOISE && Math.abs(m.y) <= MAX_NOISE);
    }
});

test("the same seed gives the same radar readings", () => {
    const aircraft = new Aircraft(10, 10, 0, 0);
    const a = new Radar(MAX_NOISE, seededRandom(42));
    const b = new Radar(MAX_NOISE, seededRandom(42));
    for (let i = 0; i < 5; i++) assert.deepEqual(a.measure(aircraft), b.measure(aircraft));
});

test("alpha-beta filter learns the true velocity from perfect measurements", () => {
    const filter = new AlphaBetaFilter(0.5, 0.2);
    let result;
    for (let t = 0; t <= 60; t++) result = filter.update({ x: 50 * t, y: 20 * t }, 1);
    assert.ok(Math.abs(result.velocity.x - 50) < 0.01);
    assert.ok(Math.abs(result.velocity.y - 20) < 0.01);
});

test("Kalman filter starts at the first measurement", () => {
    const filter = new KalmanFilter(1);
    assert.equal(filter.update(123, 1), 123);
});

test("Kalman filter learns velocity after two perfect measurements", () => {
    const filter = new KalmanFilter(0.0001);
    filter.update(100, 1);
    filter.update(150, 1);
    assert.ok(Math.abs(filter.velocity - 50) < 0.1);
});

test("Kalman filter follows a moving target (the old filter fell far behind)", () => {
    const filter = new KalmanFilter(1);
    let estimate;
    for (let t = 1; t <= 20; t++) estimate = filter.update(100 + 50 * t, 1);
    assert.ok(Math.abs(estimate - (100 + 50 * 20)) < 1);
});

const results = runMonteCarlo(1000, 20);

test("over 1,000 flights the Kalman filter beats the raw radar and the alpha-beta filter", () => {
    assert.ok(results.kalman.mean < results.radar.mean);
    assert.ok(results.kalman.mean < results.alphaBeta.mean);
});

test("Kalman filter is consistent: NEES averages 4 and NIS averages 2", () => {
    assert.ok(Math.abs(results.nees.mean - 4) < 3 * results.nees.standardError + 0.2);
    assert.ok(Math.abs(results.nis.mean - 2) < 3 * results.nis.standardError + 0.1);
});

test("with a two-point start the alpha-beta filter also beats the raw radar", () => {
    assert.ok(results.alphaBeta.mean < results.radar.mean);
});
