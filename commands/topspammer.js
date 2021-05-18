const StatHandler = require("../helpers/stat-handler.js");
const TotalsUpdater = require("../helpers/totals-updater.js");

module.exports = {
	name: 'topspammer',
	description: 'Get top angry spammers',
	async execute(msg) {
        await TotalsUpdater.updateTotalsForAllChannels(msg.channel);
    
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
                "angrys": value[StatHandler.USER_ANGRY_EMOJIS_SENT]
            };
            spammerArray.push(spammerObj);
        }

        spammerArray.sort((a, b) => {
            return b.angrys - a.angrys;
        });

        spammerArray.forEach((spammer) => {
            result += `${spammer.name} sent ${spammer.angrys} angrys.\n`;
            if(result.length >= 1900) {
                msg.channel.send(result);
                result = "";
            }
        });
        msg.channel.send(result);
	},
};