const StatHandler = require("../helpers/stat-handler.js");
const angryTarotTexts = require("../config/angry-tarot.json");
const {promises: {readFile, writeFile}} = require("fs");
const angrys = require("../config/angry-emojis.json");

const angryTarotCacheFile = "./stats-and-cache/angry-tarot-cache.json";

/**
 * Remember the daily angry emoji of all server users
 */
 let angryTarot = {};

 readFile(angryTarotCacheFile)
    .then(fileBuffer => {
        const data = JSON.parse(fileBuffer.toString());
        angryTarot = {};

        Object.entries(data).forEach(entry => {
            const [key, value] = entry;

            if(value.timestamp > new Date().setHours(0, 0, 0, 0)) {
                angryTarot[key] = value;
            }
        });
    }).catch(err => {
        console.error("Error reading tarot cache: " + JSON.stringify(err));
    });

module.exports = {
	name: 'tarot',
	description: 'Get your daily angry tarot',
	execute(msg) {
        const amountOfTarots = 100;

        // If the user has already a tarot cached that was read today, be angry with him
        if(angryTarot[msg.author.id] && 
            angryTarot[msg.author.id].timestamp > new Date().setHours(0,0,0,0) && 
            angryTarot[msg.author.id].timestamp < new Date().setHours(24,0,0,0)) {

                let text = angryTarotTexts[angryTarot[msg.author.id].tarot].text;
                text = text.replaceAll(":angry:", angrys[angryTarot[msg.author.id].tarot]);
                
                let options = {};
                if(angryTarotTexts[angryTarot[msg.author.id].tarot].files) {
                    options = {"files": angryTarotTexts[angryTarot[msg.author.id].tarot].files};
                }
                msg.reply(`I already told you, your angry today is ${angrys[angryTarot[msg.author.id].tarot]}.\n${text}\n\nYou can get a new one tomorrow (in ${(new Date().setHours(24, 0, 0, 0) - Date.now())/60000} Minutes).`, options);
        } else {
            msg.reply(`Let me sense your angry...`);
            // Assign a new random daily angry emoji
            const dailyAngry = Math.floor(Math.random() * amountOfTarots);
            angryTarot[msg.author.id] = {"tarot": dailyAngry, "timestamp": Date.now()};

            StatHandler.incrementTarotStat(msg.author.id, msg.author.username, dailyAngry);

            setTimeout(() => {
                let text = angryTarotTexts[dailyAngry].text;
                text = text.replaceAll(":angry:", angrys[dailyAngry]);

                let options = {};
                if(angryTarotTexts[dailyAngry].files) {
                    options = {"files": angryTarotTexts[angryTarot[msg.author.id].tarot].files};
                }
                msg.reply(`Your angry today is :angry${dailyAngry+1}: ${angrys[dailyAngry]}\n\n${text}`, options);
            }, 2000);

            writeFile(angryTarotCacheFile, JSON.stringify(angryTarot))
                .catch((err) => {
                    console.error("Writing cache failed: " + JSON.stringify(err));
                });
        }
	},
};