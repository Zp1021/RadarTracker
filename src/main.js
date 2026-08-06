import Aircraft from "./classes/Aircraft.js";
import Radar from "./classes/Radar.js";

const aircraft = new Aircraft(
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
  const measurementX = measurement.x;
  const measurementY = measurement.y;
  

  // Log update count and aircraft position
  console.log(`Updated ${count} time(s)`);

  // Log Aircrafts position to the console
  console.log("Actual position:");
  console.log(aircraft.getPosition());

  // Log the radar measurements to the console
  // formatting to 3 decimals
  console.log("Radar measurement:");
  console.log(`x: ${measurementX.toFixed(3)}, y: ${measurementY.toFixed(3)}`);

  // If the update count is greater than the tracking limit
  if (count >= maxRuns) {

    // Stops the interval
    clearInterval(intervalId); 
    
    //Log to console that tracking has stopped
    console.log("Tracking stopped.");
  }
}, 1000);
