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

    /**
     * Return the time in days, hours, minutes and seconds between two timestamps
     * @param {Number} start Starting timestamp
     * @param {Number} end Ending timestamp
     * @returns {Object} An object containing the time difference between the two timestamps
     * @example { days: 2, hours: 3, minutes: 8, seconds: 20 }
     */
    getTimeDiff(start, end) {
        const diff = end - start;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    },
};