module.exports = {
    /**
     * Get a random number between min and max. min and max may also be included in the result.
     * @param {Number} min Starting Number
     * @param {Number} max Last number
     * @returns A random number between start and end
     */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min +1)) + min;
    },
};