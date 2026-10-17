// Prints the Monte Carlo validation report. Run with: npm run validate
import { runMonteCarlo } from "./simulate.js";

const FLIGHTS = 1000;
const STEPS = 20;
const r = runMonteCarlo(FLIGHTS, STEPS);

const line = (label, s) => ` ${label.padEnd(26)} ${s.mean.toFixed(3)} (+/- ${s.standardError.toFixed(3)})`;

console.log(`Monte Carlo validation: ${FLIGHTS} flights, ${STEPS} updates each\n`);
console.log("Average distance from the real aircraft (lower is better)");
console.log(line("Raw radar measurement", r.radar));
console.log(line("Alpha-beta filter", r.alphaBeta));
console.log(line("Kalman filter", r.kalman));
console.log("\nKalman filter consistency (is its confidence justified?)");
console.log(line("Average NEES (expect 4)", r.nees));
console.log(line("Average NIS (expect 2)", r.nis));

const checks = [
    ["NEES consistent", Math.abs(r.nees.mean - 4) < 3 * r.nees.standardError + 0.2],
    ["NIS consistent ", Math.abs(r.nis.mean - 2) < 3 * r.nis.standardError + 0.1],
    ["Kalman beats raw radar", r.kalman.mean < r.radar.mean]
];

console.log("");
for (const [name, ok] of checks) console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
