# RadarTracker

This project demonstrates a browser simulation of radar tracking. 
An aircraft flies across the screen, a simulated radar reports its 
position with random error, and two filters try to recover the true 
track: a fixed-gain alpha-beta filter and a constant-velocity
Kalman filter. The tracker was built with plain JavaScript,
HTML5 Canvas, and without the use of libraries.

**Live demo:** https://zp1021.github.io/RadarTracker/

![tests](https://github.com/Zp1021/RadarTracker/actions/workflows/tests.yml/badge.svg)

## What you see
- Blue: the actual aircraft
- Red: radar measurements (up to 5 units of error on each axis)
- Green: alpha-beta filter estimate
- Purple: Kalman filter estimate

Each run is 20 radar updates, the same as one flight in the validation report
below. The line under the canvas shows each one's average distance from the
real aircraft, leaving out the first two start-up updates. A single run has
some luck in it; the results table averages 1,000 runs.

## How the filters work
Both filters repeat two steps for every radar reading: predict where the
aircraft should be (distance = speed x time), then correct that prediction
using the reading.

- **Alpha-beta** corrects by fixed amounts (alpha = 0.5 for position,
    beta = 0.2 for velocity). It takes its starting velocity from the
    first two readings (a two-point start).
- **Kalman** estimates position and velocity together with their uncertainty,
    and computes how much to trust each reading on every update. It trusts the
    radar heavily at first and less as it learns the velocity.

## Results
Measured over 1,000 simulated flights of 20 updates each
(`npm run validate`, seeded so the numbers are the same on every computer).
The first two updates of each flight are start-up and are not counted: one
reading gives a position, and a second is needed to know the velocity.

| Average distance from the real aircraft | Units |
|---|---|
| Raw radar measurement | 3.82 |
| Alpha-beta filter | 2.77 |
| Kalman filter | 2.15 |

Both filters are more accurate than the radar they listen to, and the Kalman
filter is the most accurate. An earlier version started the alpha-beta filter
at zero velocity, which made it trail the aircraft (average error 8.35); the
two-point start fixed that.

Consistency checks for the Kalman filter, which test whether its own
uncertainty matches its real error: average NEES 4.01 (expected 4) and average
NIS 1.98 (expected 2). Both pass.

## Running it locally
Browsers will not load JavaScript modules from a file opened directly from the
disk, so the page must be served by a local web server. Either:
- In VS Code, right-click `index.html` and choose Open with Live Server, or
- Run `npx serve .` in this folder and open the address it prints.

## Tests
Requires Node.js 18 or newer. Nothing to install. GitHub Actions runs both
commands on every push.
```
npm test # 10 automated tests
npm run validate # 1,000-flight Monte Carlo report
```

## Project structure
```
index.html                      page and canvas
styles/style.css                page styling
src/main.js                     simulation loop, drawing, live results
src/classes/Aircraft.js         constant-velocity aircraft
src/classes/Radar.js            noisy position sensor
src/classes/AlphaBetaFilter.js  fixed-gain filter with a two-point start
src/classes/KalmanFilter.js     constant-velocity Kalman filter
src/utils/Noise.js              random error between two limits
tests/                          tests, simulation helper, validation report
.github/workflows/tests.yml     runs the tests and validation on every push
```

## License
MIT
