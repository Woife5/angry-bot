const Discord = require("discord.js");
const client = new Discord.Client();
const {promises: {readdir}} = require("fs");
const settings = require("./config/settings.json");
const GoogleSheetHandler = require("./helpers/google-sheets-handler.js");
const Helpers = require("./helpers/helper-functions.js");
const io = require("@pm2/io");

//******************************************************
//                 PM2 metrics
//******************************************************

// Open reactions counter and pm2 metric
let openReactions = 0;
const openReactionsMetric = io.metric({
    name: "Open reactions",
    is: "angry/openReactions",
    value: openReactions
});

// Errors while running counter
const thrownErrors = io.counter({
    name: "Thrown Errors"
});

const StatHandler = require("./helpers/stat-handler.js");

const {prefix, botID, angryAmount} = require("./config/bot-constants.json");

// Wolfgang, Felix, Vali Discord IDs
const admins = ["267281854690754561", "138678366730452992", "351375977303244800"];

/**
 * An object containing all custom reactions that can be updated while the bot is running
 */
const customAngrys = require("./config/custom-reactions.json");

/**
 * A list of all angry emojis on the official angry discord: https://discord.gg/pZrBRA75wz
 */
const angrys = require("./config/angry-emojis.json");

// Import bot commands:
client.commands = new Discord.Collection();
readdir("./commands").then(files => {
    files.filter(file => file.endsWith('.js'));

    for(const file of files) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
})

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus("online");
    client.user.setActivity(`"${prefix}"`, {type: "LISTENING"});

    // Send update request every 5 days
    client.setInterval( updateGoogleToken, 432000000 );
});

client.login(settings["client-secret"]);

client.on("message", (msg) => {

    // Only react on messages not sent by the bot
    if(msg.author.id == botID)
        return;

    // Check if message contains a new token string
    if(msg.author.id === "267281854690754561" && msg.channel.type === "dm" && !msg.cleanContent.startsWith(prefix)) {
        GoogleSheetHandler.setNewToken(msg.cleanContent).then(success => {
            if(success) {
                const validThru = new Date();
                validThru.setDate(validThru.getDate() + 7);
                msg.channel.send(`New token was set, valid until ${validThru.toLocaleDateString("de-AT")}`);
            } else {
                msg.channel.send("Error setting new token!");
            }
        })
    }

    // Return if the bot is in debug mode
    if(settings["debug"] && msg.author.id !== "267281854690754561") {
        if(msg.content.startsWith(prefix)) {
            msg.reply("I am right now being operated on x.x Try again later...");
        }
        return;
    }

    // Return if the bot is messaged privatley or not in the official angry discord
    if(msg.channel.type !== "text" || msg.guild.id !== "824231029983412245") {
        if(msg.content.startsWith(prefix)) {
            msg.channel.send("https://discord.gg/pZrBRA75wz");
        }
        return;
    }

    // Handle feetpic channel
    if(msg.channel.id === "846058921730113566") {
        // Check if message if feet-related
        if(!feetRelated(msg.content) && msg.attachments.size <= 0) {
            msg.delete({ reason: "This is not realated to feet!" });
            StatHandler.incrementStat(StatHandler.NON_FEET_RELATED_MESSAGES_DELETED);
        } else {
            if(msg.attachments.size > 0)
                addReactions(msg, ["✅", "❎"]);
        }
        return;
    }

    //* Handle commands
    if(msg.content.startsWith(prefix)) {
        // Message is a command
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase() || "help";

        if(client.commands.has(command)) {

            try {
                const commandRef = client.commands.get(command);

                if(commandRef.args && args.length < commandRef.args) {
                    let reply = `You did not provide any arguments, ${msg.author}`;
                    if(commandRef.usage) {
                        reply += `\nThe proper usage would be: \`${prefix} ${commandRef.name} ${commandRef.usage}\``;
                    }
                    return msg.channel.send(reply);
                }

                if(commandRef.adminOnly && !msg.member.roles.cache.has("824234599936557097")) {
                    return msg.channel.send(`You do not have permission to use this command 🥴`);
                }

                commandRef.execute(msg, args);
            } catch (error) {
                console.error(error);
                msg.reply("An error occured 🥴");
                thrownErrors.inc();
            }
            return;

        } else {
            msg.reply(`That is not a command i know of 🥴`);
        }
    }
    //*/

    //* Be extra angry if divotkey is mentioned
    if(msg.cleanContent.toLocaleLowerCase().includes("roman") || msg.cleanContent.toLocaleLowerCase().includes("divotkey"))
    {
        msg.reply(`AAAAH ROMAN! ${angrys[0]} ${angrys[0]} ${angrys[0]}\n:clock10: :rolling_eyes:`);
        StatHandler.incrementStat(StatHandler.DIVOTKEY_REACTIONS);
    }
    //*/

    // Check if something needs to be censored
    if(client.commands.get("censorship").censor(msg)) {
        return;
    }

    StatHandler.updateEmojisSent(msg);

    // Check if custom reactions need to be applied
    if(msg.author.id in customAngrys) {
        const custom  = customAngrys[msg.author.id];
        addReactions(msg, custom.reactions);
        if(custom.reply) {
            msg.reply(custom.reply);
        }
        StatHandler.incrementStat(StatHandler.BOT_ANGRY_REACTIONS, custom.angrys);
        return;
    }

    // React every message with the set amount of angrys
    addReactions(msg, angrys.slice(0, angryAmount));
    StatHandler.incrementStat(StatHandler.BOT_ANGRY_REACTIONS, angryAmount);
});

// Handle reactions
client.on("messageReactionAdd", async (messageReaction, user) => {

    // Only do something in feetpic channel
    if(admins.includes(user.id) && messageReaction.message.channel.id === "846058921730113566") {
        if(messageReaction.emoji.toString() === "❎") {
            StatHandler.incrementStat(StatHandler.NON_FEET_RELATED_MESSAGES_DELETED);
            const message = await messageReaction.message.channel.send("`Image removed by moderator`\n`no feet 🦶`");
            await messageReaction.message.delete({ reason: "Not approved by admin." });
            message.delete({timeout: 10000, reason: "Not required any longer."});
        }

        if(messageReaction.emoji.toString() === "✅") {
            messageReaction.message.reactions.removeAll();

            // Add rating to image
            const rating = Math.round(Math.random() * 9) + 1;
            const rating = Helpers.getRandomInt(1, 10);
            const emoji = getRatingEmoji(rating);
            messageReaction.message.reply(`${rating}/10 🦶 ${emoji}`);

            await messageReaction.message.react("🦶");
            await messageReaction.message.react(emoji);
        }
    }
});

// Handle edited messages
client.on("messageUpdate", (oldMessage, newMessage) => {
    // A message has been updated

    if(newMessage.guild.id !== "824231029983412245")
        return;

    // Check if the new message has to be censored
    if(client.commands.get("censorship").censor(newMessage)) {
        return;
    }

    // Check if the new message in the feetpic channel contains feet
    if(newMessage.channel.id === "846058921730113566") {
        // Check if message if feet-related
        if(!feetRelated(newMessage.content)) {
            newMessage.delete({ reason: "This is not realated to feet!" });
            StatHandler.incrementStat(StatHandler.NON_FEET_RELATED_MESSAGES_DELETED);
        }
    }
});

//******************************************************
//                 HELPER FUNCTIONS
//******************************************************

/**
 * Adds a given array of reactions to a message on discord
 * @param {Message} msg Message to react to
 * @param {Array} reactions Array of reactions to add
 */
async function addReactions(msg, reactions) {
    openReactions += reactions.length;
    openReactionsMetric.set(openReactions);
    for(let i = 0; i < reactions.length; i++) {
        try {
            await msg.react(reactions[i]);
        } catch (error) {
            thrownErrors.inc();
        }
        openReactionsMetric.set(--openReactions);
    }
}

async function updateGoogleToken() {
    const wolfgang = await client.users.fetch("267281854690754561");
    const tokenUrl = await GoogleSheetHandler.getTokenUrl();
    await wolfgang.send("It seems I will soon need a new Google API token...\n" + tokenUrl);
}

function getRatingEmoji(rating) {
    let emoji = "";
    switch (rating) {
        case 1:
            emoji = Math.random() > 0.5 ? "🤮" : "😭";
            break;
        case 2:
            emoji = Math.random() > 0.5 ? "🤢" : "🤣";    
            break;
        case 3:
            emoji = Math.random() > 0.5 ? "😟" : "🥲";    
            break;
        case 4:
            emoji = Math.random() > 0.5 ? "🙄" : "😧";    
            break;
        case 5:
            emoji = Math.random() > 0.5 ? "🙂" : "🤗";    
            break;
        case 6:
            emoji = Math.random() > 0.5 ? "😋 " : "🥰";    
            break;
        case 7:
            emoji = Math.random() > 0.5 ? "😳" : "😘";    
            break;
        case 8:
            emoji = Math.random() > 0.5 ? "😍" : "😎";    
            break;
        case 9:
            emoji = Math.random() > 0.5 ? "🥳" : "🤑";    
            break;
        case 10:
            const possible = ["🥴","🥵","😱"];
            emoji = possible[Helpers.getRandomInt(0, possible.length-1)];
            break;
    
        default:
            break;
    }
    return emoji;
}

/**
 * Checks weather a message (string) is feet-related
 * @param {String} message Content of a message
 * @returns If the message is feet-related
 */
function feetRelated(message) {
    const text = message.toLowerCase().trim();
    const feetRelated = ["🦵", "🦶", "👣", "🐾", "fuß", "feet", "fuss", "foot", "füsse", "füße", "leg", "bein"];

    for (let i = 0; i < feetRelated.length; i++) {
        if(text.includes(feetRelated[i])) {
            return true;
        }
    }

    return false;
}
