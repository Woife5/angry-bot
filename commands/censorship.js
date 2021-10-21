const StatHandler = require("../helpers/stat-handler.js");
const {
    promises: { readFile, writeFile },
} = require("fs");
const { prefix } = require("../config/bot-constants.json");

const censordEmojiCacheFile = "./stats-and-cache/censored-emoji.json";
let censordEmoji;

readCache();

async function writeCache() {
    writeFile(censordEmojiCacheFile, JSON.stringify(Array.from(censordEmoji)));
}

async function readCache() {
    try {
        const fileBuffer = await readFile(censordEmojiCacheFile);
        const emojiCache = JSON.parse(fileBuffer.toString());
        censordEmoji = new Set(emojiCache);
    } catch (error) {
        console.error("Something went wrong reading the cencorship file.");
        console.error(error);
    }
}

module.exports = {
    name: "censorship",
    description: "Add to or remove from cencored emojis",
    adminOnly: true,
    args: 2,
    usage: "<add/remove> <Emoji/String>",
    hidden: true,
    execute(msg, args) {
        const subcommand = args.shift().toLowerCase().trim();
        const emoji = args.shift().toLowerCase().trim();

        if (subcommand === "add") {
            censordEmoji.add(emoji);
        } else if (subcommand === "remove") {
            censordEmoji.delete(emoji);
        } else {
            return msg.channel.send(
                `Not a valid command. Proper usage would be:\n\`${prefix} ${this.name} ${this.usage}\``
            );
        }

        writeCache();

        msg.channel.send(
            `I have ${subcommand === "add" ? "added" : "removed"} \`${emoji}\` to the list of censored emoji:`
        );

        let reply = "";
        censordEmoji.forEach(emoji => {
            reply += `${emoji} `;
        });
        msg.channel.send(reply);
    },
    censor(msg) {
        let hasToBeCensord = false;
        let cencoredContent = msg.content.replaceAll("\\", "\\ ");

        censordEmoji.forEach(emoji => {
            if (msg.content.includes(emoji)) {
                hasToBeCensord = true;
                cencoredContent = cencoredContent.replaceAll(emoji, "`CENCORED` ");
            }
        });

        if (!hasToBeCensord) {
            return false;
        }

        if (cencoredContent.length >= 1940) {
            const cutAt = cencoredContent.indexOf(" ", 1850);
            if (cutAt < 0 || cutAt > 1950) {
                cencoredContent = cencoredContent.substr(0, 1950);
            } else {
                cencoredContent = cencoredContent.substr(0, cutAt);
            }
        }
        cencoredContent += "\nThat is illegal!";

        msg.reply(cencoredContent);

        msg.delete().catch(err => {
            console.error(err);
        });

        StatHandler.incrementCencoredStat(msg.author.id, msg.author.username);

        return true;
    },
};
