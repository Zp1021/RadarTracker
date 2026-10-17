import Aircraft from "./classes/Aircraft.js";
import Radar from "./classes/Radar.js";
import AlphaBetaFilter from "./classes/AlphaBetaFilter.js";
import KalmanFilter from "./classes/KalmanFilter.js";

//  Get the simulation canvas and its 2D drawing context
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

//Set the canvas dimensions in pixels
canvas.width = 800;
canvas.height = 600;

// Draw a circular point athe the given coordinates
function drawPoint(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Draw a line connecting a series of recorded positions
function drawTrail(positions, color) {

  // A trail requires at least two positions
  if (positions.length < 2) {
    return;
  }

  ctx.beginPath();

  // Start the trail at the first recorded position
  ctx.moveTo(positions[0].x, positions[0].y);

  // Connect each subsequent position to the previous one
  for (let i = 1; i < positions.length; i++) {
    ctx.lineTo(positions[i].x, positions[i].y);
  }

  // Set the trail's appearance and draw it
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Draw a legend in the bottom-left corner explaining what each color means
function drawLegend() {
  const entries = [
    ["Blue", "Actual aircraft"],
    ["Red", "Radar measurement"],
    ["Green", "Alph-beta estimate"],
    ["Purple", "Kalman estimate"]
  ];

  ctx.font = "14px sans-serif";

  entries.forEach(([color, label], index) =>{
    const y = canvas.height - 90 + index * 22;
    drawPoint(20, y, color);
    ctx.fillStyle = "#222";
    ctx.fillText(label, 34, y + 5);
  });
}

// Straight-line distance between two positions
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Call the filter function with alpha of .5 and beta of .2
const filter = new AlphaBetaFilter(0.5, 0.2);

const measurementVariance = (5 ** 2) / 3;

const kalmanX = new KalmanFilter(measurementVariance);
const kalmanY = new KalmanFilter(measurementVariance);

const aircraft = new Aircraft(
  // Test positions 
  100,
  100,

  // Test velocity
  50,
  20
)

// Create radar sensor with maximum noise of 5 units
const radar = new Radar(5);

// Constant change in time by 1 second
const dt = 1;

// Counting update intervals
let count = 0;

// Tracking limit
const maxRuns = 10;

// Store the aircraft's true position at each update
const actualPositions = [];

// Store each noisy radar measurement
const measurements = [];

// Store the estimates processed by the filter
const estimates = [];

// Store the positions estimated by the Kalman filter
const kalmanEstimates = [];

// Running totals of how far each one was from the real aircraft
let radarErrorTotal = 0;
let alphaBetaErrorTotal = 0;
let kalmanErrorTotal = 0;

// Page element that shows the average errors under the canvas
const stats = document.getElementById("stats");

// Reload the page to run the simulation again
document.getElementById("restart").addEventListener("click", () => {
  location.reload();
});

// Interval function called every 1000 milliseconds
const intervalId = setInterval(() => {

  count++;

  // Update aircraft position every 1 second
  aircraft.update(dt);

  // Measure aircraft position using radar
  const measurement = radar.measure(aircraft);

  // Provide updated values to the filter function
  const estimate = filter.update(measurement, dt);

  // Log the position of the filter estimates
  console.log(
    "Alpha-Beta Estimate (x, y):",
    estimate.position.x.toFixed(3),
    estimate.position.y.toFixed(3)
  );

  // Log the velocity of the filter function 
  console.log(
    "Alpha-Beta velocity (x, y):",
    estimate.velocity.x.toFixed(3),
    estimate.velocity.y.toFixed(3)
  );
  // Provide updated values to the kalman filter function
  const kalmanXEstimate = kalmanX.update(measurement.x, dt);
  const kalmanYEstimate = kalmanY.update(measurement.y, dt);

  // Combine x and y estimates into one usable position object
  const kalmanEstimate = {
    position: {
      x: kalmanXEstimate,
      y: kalmanYEstimate
    }
  };

  // Log the Kalman position estimate
  console.log(
    "Kalman Estimate (x, y):",
    kalmanEstimate.position.x.toFixed(3),
    kalmanEstimate.position.y.toFixed(3)
  );

  // Clear the previous frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Get actual aircraft positon
  const actualPosition = aircraft.getPosition();

  // Store current positions so their movement can be drawn as trails
  actualPositions.push(actualPosition);
  measurements.push(measurement);
  estimates.push(estimate.position);
  kalmanEstimates.push(kalmanEstimate.position);

  // Draw actual aircraft trail
  drawTrail(actualPositions, "blue");

  // Draw radar measurement trail
  drawTrail(measurements, "red");

  // Draw estimated filter trail
  drawTrail(estimates, "green");

  // Purple = Kalman filter estimate
  drawTrail(kalmanEstimates, "purple");

  // Draw actual aircraft position
  drawPoint(actualPosition.x, actualPosition.y, "blue");

  // Draw radar measurement
  drawPoint(measurement.x, measurement.y, "red");

  // Draw filter points by position
  drawPoint(estimate.position.x, estimate.position.y, "green");

  // Draw current Kalman filter estimate
  drawPoint(kalmanEstimate.position.x, kalmanEstimate.position.y, "purple");

  // Draw the color legend
  drawLegend();

  // Add this update's errors to the running totals
  radarErrorTotal += distance(measurement, actualPosition);
  alphaBetaErrorTotal += distance(estimate.position, actualPosition);
  kalmanErrorTotal += distance(kalmanEstimate.position, actualPosition);

  // Show the average error of each one so far (lower is better)
  stats.textContent = 
  `Average error after ${count} updates: ` +
  `Radar ${(radarErrorTotal / count).toFixed(1)} | ` +
  `Alpha-beta ${(alphaBetaErrorTotal / count).toFixed(1)} | ` +
  `Kalman ${(kalmanErrorTotal / count).toFixed(1)}`;

  // Log update count and aircraft position
  console.log(`Updated ${count} time(s)`);

  // Log Aircrafts position to the console
  console.log("Actual position:");
  console.log(actualPosition);

  // Log the radar measurements to the console
  // formatting to 3 decimals
  console.log("Radar measurement:");
  console.log(`x: ${measurement.x.toFixed(3)}, y: ${measurement.y.toFixed(3)}`);

  // If the update count is greater than the tracking limit
  if (count >= maxRuns) {

    // Stops the interval
    clearInterval(intervalId);

    //Log to console that tracking has stopped
    console.log("Tracking stopped.");
  }
}, 1000);
