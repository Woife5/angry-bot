const StatHandler = require("../helpers/stat-handler.js");

module.exports = {
    name: "count",
    description: "Get total amount of angry reactions by the bot",
    execute(msg) {
        const amount = StatHandler.getStat(StatHandler.BOT_ANGRY_REACTIONS);
        msg.channel.send(`I have reacted angry ${amount.toLocaleString("de-AT")} times.`);
    },
};
