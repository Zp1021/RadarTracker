import Aircraft from "./classes/Aircraft.js";
import Radar from "./classes/Radar.js";

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


const aircraft = new Aircraft (
    // Test positions 
    100,
    100,
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
const maxRuns = 5;

// Store the aircraft's true position at each update
const actualPositions = [];

// Store each noisy radar measurement
const measurements = [];

// Interval function called every 1000 milliseconds
const intervalId = setInterval(() => {
  
  count++;  

  // Update aircraft position every 1 second
  aircraft.update(dt);

  // Measure aircraft position using radar
  const measurement = radar.measure(aircraft);
  
  // Clear the previous frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Get actual aircraft positon
  const actualPosition = aircraft.getPosition();

  // Store current positions so their movement can be drawn as trails
  actualPositions.push(actualPosition);
  measurements.push(measurement);

  // Draw actual aircraft trail
  drawTrail(actualPositions, "blue");

  // Draw radar measurement trail
  drawTrail(measurements, "red");

  // Draw actual aircraft position
  drawPoint(actualPosition.x, actualPosition.y, "blue");

  // Draw radar measurement
  drawPoint(measurement.x, measurement.y, "red");

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
