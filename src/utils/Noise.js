// Exporting a function that randomizes between a min and max range
export default function randomNoise(min, max) {

    // Return random range
    return Math.random()*(max - min) + min;

}