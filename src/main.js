import Aircraft from "./classes/Aircraft.js";
import Radar from "./classes/Radar.js";

const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

function drawPoint(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
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
