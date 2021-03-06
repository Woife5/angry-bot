const StatHandler = require("../helpers/stat-handler.js");
const { getRandomInt, appendToErrorLog } = require("../helpers/helper-functions");
const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");

const randomUrl = "https://nekos.moe/api/v1/random/image";
const imageUrl = "https://nekos.moe/image/";

module.exports = {
    name: "catgirl",
    description: "Get a random catgirl image",
    adminOnly: false,
    args: 0,
    usage: "",
    async execute(msg, args) {
        try {
            // load result from api and parse response
            const res = await fetch(randomUrl);
            const result = await res.json();

            const randomWord = result.images[0].tags[getRandomInt(0, result.images[0].tags.length - 1)];
            const image = imageUrl + result.images[0].id;

            // TODO possibly alter the image and make it angry?

            // send answer
            const embed = new MessageEmbed()
                .setTitle("Catgirl")
                .setDescription(`Look at this ${randomWord} catgirl i found uwu`)
                .setColor("#e91a1a")
                .setAuthor(
                    "Angry Bot",
                    "https://cdn.discordapp.com/attachments/314440449731592192/912125148474245221/angry.png"
                )
                .setImage(image);

            msg.reply(embed).catch(err => {
                appendToErrorLog(JSON.stringify(err), "catgirl");
            });

            // increment stats
            StatHandler.incrementStat(StatHandler.NEEKOS_REQUESTED);
            StatHandler.incrementUserStat(msg.author.id, StatHandler.NEEKOS_REQUESTED);
        } catch (e) {
            appendToErrorLog(JSON.stringify(e), "catgirl");
        }
    },
};
