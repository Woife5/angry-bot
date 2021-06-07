const StatHandler = require("../helpers/stat-handler.js");

module.exports = {
	name: 'topspammer',
	description: 'Get top angry spammers',
	async execute(msg) {

        const userStats = StatHandler.getAllUserStats();
        let result = "";
        const spammerArray = [];

        const userStatEntries = Object.entries(userStats);
        for ([key, value] of userStatEntries) {
            if(!value[StatHandler.USER_ANGRY_EMOJIS_SENT]) {
                continue;
            }

            const spammerObj = {
                "name": value.name,
                "id": key,
                "angrys": value[StatHandler.USER_ANGRY_EMOJIS_SENT]
            };
            spammerArray.push(spammerObj);
        }

        spammerArray.sort((a, b) => {
            return b.angrys - a.angrys;
        });

        spammerArray.forEach((spammer) => {
            result += `<@${spammer.id}> sent ${spammer.angrys.toLocaleString("de-AT")} angry emojis.\n`;
            if(result.length >= 1900) {
                msg.channel.send(result);
                result = "";
            }
        });
        msg.channel.send(result);
	},
};