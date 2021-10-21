const StatHandler = require("../helpers/stat-handler.js");

module.exports = {
    name: "tarotcount",
    description: "Get total amount of angry tarots requested",
    execute(msg) {
        const amount = StatHandler.getStat(StatHandler.TAROTS_READ);
        msg.channel.send(`I have read angry tarots ${amount.toLocaleString("de-AT")} times.`);
    },
};
