import Aircraft from "./classes/Aircraft.js";
import  randomNoise from "./utils/Noise.js";

const aircraft = new Aircraft(
    // Test positions 
    100,
    100,
    50,
    20
)

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

  // Log update count and aircraft position
  console.log(`Updated ${count} time(s)`);
  console.log(aircraft.getPosition());

  // If the update count is greater than the tracking limit
  if (count >= maxRuns) {

    // Stops the interval
    clearInterval(intervalId); 
    
    //Log to console that tracking has stopped
    console.log("Tracking stopped.");
  }
}, 1000);

// Simulating 10 random instances of radar noise
for (let i=0; i<10; i++){

  // Calling randomNoise function
  const noise = randomNoise(-5,5);
  
  // Formatting noise to 3 decimals and logging to console
  console.log(`Noise: ${noise.toFixed(3)}`);
}
