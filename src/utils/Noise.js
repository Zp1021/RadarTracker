// Exporting a function that randomizes between a min and max range
export default function randomNoise(min, max, random = Math.random) {

    // Return random range
    return random() * (max - min) + min;
}