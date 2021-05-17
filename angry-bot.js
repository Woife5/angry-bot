const Discord = require("discord.js");
const client = new Discord.Client();
const {promises: {readFile, writeFile, readdir}} = require("fs");
const settings = require("./config/settings.json");

const StatHandler = require("./helpers/stat-handler.js");

/**
 * Prefix for all angry-commands
 */
const prefix = "?angry";

/**
 * Unique ID of the Angry Bot user
 */
const botID = "824235133284253736";

/**
 * Amount of angry reactions per message
 */
const angryAmount = 5;

/**
 * Allow any user to issue a command that searches through every message on the server
 */
let allowLeaderboardCommand = true;

/**
 * All relevant File locations
 */
const customReactionsFile = "./config/custom-reactions.json";


/**
 * An object containing all custom reactions that can be updated while the bot is running
 */
let customAngrys;

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
});

client.login(settings["client-secret"]);

// Read custom config from fs while bot is starting
updateCustomReactions();

client.on("message", (msg) => {

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

    // Only react on messages not sent by the bot
    if(msg.author.id == botID)
        return;

    //* Handle commands
    if(msg.content.startsWith(prefix)) {
        // Message is a command
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if(client.commands.has(command)) {
            console.log("Found command in collection, executing...");

            try {
                client.commands.get(command).execute(msg, args);
            } catch (error) {
                console.error(error);
                msg.reply("An error occured 🥴");
            }
            return;
        }

        // Admin commands
        if(msg.author.id === "267281854690754561" || msg.author.id === "138678366730452992" || msg.author.id === "351375977303244800") {
            if(command === "flushtarot") {
                angryTarot = {};
                msg.channel.send("All saved Tarots have been cleared!");
                return;
            }

            if(command === "updatereactions") {
                updateCustomReactions();
                return;
            }

            if(command === "loadtarot") {
                loadCachedTarots();
                msg.channel.send("I have successfully loaded all saved tarots");
                return;
            }

            if(command === "debug") {
                if(msg.author.id === "267281854690754561")
                    StatHandler.saveStatsToGoogleSheet();
                return;
            }
            
            if(command === "removesavedemoji") {
                StatHandler.removeSavedEmoji();
                return;
            }
        }

        if(!command) {
            let commands = "Possible Commands:\n";
            commands += "`" + prefix + " tarot` - Get your daily angry\n";
            commands += "`" + prefix + " stats` - Get all current bot-stats\n";
            commands += "`" + prefix + " tarotcount` - See the number tarots I have read\n";
            commands += "`" + prefix + " count` - Get total amount of angry reactions\n";
            commands += "`" + prefix + " emojilist` - Get top angry emojis\n";
            commands += "`" + prefix + " myemojilist` - Get top angry emojis sent only by you\n";
            commands += "`" + prefix + " topspammer` - Get top angry spammers\n";

            if(msg.author.id === "267281854690754561" || msg.author.id === "138678366730452992" || msg.author.id === "351375977303244800") {
                commands += "\nAdmin Commands:\n";
                commands += "`" + prefix + " flushtarot` - Remove all currently saved tarot emojis\n";
                commands += "`" + prefix + " loadtarot` - Load tarot from cache file\n";
                commands += "`" + prefix + " updatereactions` - Update the internal cache of custom angry reactions\n";
            }

            msg.channel.send(commands);
        }else if(command === "emojilist") {
            // Get list of all emojis
            rankAngryEmojis(msg.channel);
        }else if(command === "topspammer") {
            // Get top spammer
            rankAngrySpammers(msg.channel);
        }else if(command === "myemojilist") {
            // Get list of all emojis by this user
            rankAngryEmojis(msg.channel, msg.author.id);
        }else if(command === "8ball"){
            //TODO wip.
        }else{
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

    // Check if a "normal" angry emoji has been used and cencor it
    if(msg.content.includes("😠") ||
        msg.content.includes("😡") ||
        msg.content.includes("🤬")) {

        let cencoredContent = msg.content.replaceAll("\\", "\\ ");
        cencoredContent = cencoredContent.replaceAll("😠", "`CENCORED` ");
        cencoredContent = cencoredContent.replaceAll("😡", "`CENCORED` ");
        cencoredContent = cencoredContent.replaceAll("🤬", "`CENCORED` ");

        // Max message length: 1975 (@mention takes 25 characters)
        // "\nThat is illegal!" are 17 characters, `CENSORED` are 10
        // To be save, cut everything beyond 1940 chars
        if(cencoredContent.length >= 1940) {
            const cutAt = cencoredContent.indexOf(" ", 1850);
            if(cutAt < 0 || cutAt > 1950) {
                cencoredContent = cencoredContent.substr(0, 1950);
            }else {
                cencoredContent = cencoredContent.substr(0, cutAt);
            }
        }
        cencoredContent += "\nThat is illegal!";

        msg.reply(cencoredContent);

        msg.delete().catch(err => {
            console.error(err);
        });

        StatHandler.incrementCencoredStat(msg.author.id, msg.author.username);

        // Return immediatly if message is deleted.
        return;
    }

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
    for (let i = 0; i < angryAmount; i++) {
        msg.react(angrys[i]);
    }
    StatHandler.incrementStat(StatHandler.BOT_ANGRY_REACTIONS, angryAmount);
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
    for(let i = 0; i < reactions.length; i++) {
        await msg.react(reactions[i]);
    }
}

/**
 * Updates the internal cache of custom reactions
 */
function updateCustomReactions() {
    readFile(customReactionsFile).then(fileBuffer => {
        customAngrys = JSON.parse(fileBuffer.toString());
    }).catch(error => {
        console.error("Error reading custom emojis: " + error.message);
    });
}

/**
 * This function takes a dicord channel as argument and sreturns all found messages as an array
 * @param {Channel} channel The channel that should be scraped
 * @returns An array containing all messages in the given Channel
 */
async function all_messages_getter(channel) {
    const sum_messages = [];
    let last_id;
    
    while (true) {
        let options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        }
        
        const messages = await channel.messages.fetch(options);

        let messagesArray = messages.array();
        messagesArray = messagesArray.filter(message => message.author.id != botID );

        sum_messages.push(...messagesArray);
        last_id = messages.last().id;

        if (messages.size != 100) {
            break;
        }
    }

    return sum_messages;
}

async function new_messages_getter(channel, after) {
    const sum_messages = [];
    let last_id = after;
    
    while (true) {
        let options = { 
            limit: 100,
            after: last_id,
         };
        
        const messages = await channel.messages.fetch(options);

        if(messages.size == 0) {
            break;
        }

        let messagesArray = messages.array();
        messagesArray = messagesArray.filter(message => message.author.id != botID );

        sum_messages.push(...messagesArray);
        last_id = messages.first().id;

        if (messages.size != 100) {
            break;
        }
    }

    return sum_messages;
}

async function updateTotalsForAllChannels(sendChannel) {
    if(!allowLeaderboardCommand){
        sendChannel.send("I am still working...");
        return;
    }
    allowLeaderboardCommand = false;
    sendChannel.send("Let me go through all new messages real quick...");

    const channelAmount = sendChannel.guild.channels.cache.array().length;
    const allMessagesFromAllChannels = [];

    let channels = sendChannel.guild.channels.cache.map(m => m.id);

    for(let i = 0; i < channelAmount; i++) {
        let channel = sendChannel.guild.channels.cache.get(channels[i]);
        if(channel.type !== "text") {
            continue;
        }
        // Check weather there is a cached version of this channel
        let allMessages;
        const lastMessageId = StatHandler.getLastMessageId(channel.id);
        if(lastMessageId) {
            allMessages = await new_messages_getter(channel, lastMessageId);
        } else {
            allMessages = await all_messages_getter(channel);
        }

        if(allMessages.length > 0) {
            StatHandler.setLastMessageId(channel.id, allMessages[0].id);
            allMessagesFromAllChannels.push(...allMessages);
        }
    }
    StatHandler.updateTotals(allMessagesFromAllChannels);
    sendChannel.send("Ok i am done, I have gone through "+allMessagesFromAllChannels.length+" messages.");
    allowLeaderboardCommand = true;
}

async function rankAngryEmojis(sendChannel, userId = null) {
    await updateTotalsForAllChannels(sendChannel);
    const emojiStats = StatHandler.getEmojiStats(userId);
    if(!emojiStats) {
        sendChannel.send("You have not sent any angry emojis.");
        return;
    }

    let result = "";
    for (let i = 0; i < angrys.length; i++) {
        if(emojiStats[i+1]) {
            result += angrys[i] + " sent " + emojiStats[i+1] + " times"+ (userId != null ? " by you" : "") +".\n";
        }
        if(result.length >= 1700) {
            sendChannel.send(result);
            result = "";
        }
    }
    sendChannel.send(result);
}

async function rankAngrySpammers(sendChannel) {
    await updateTotalsForAllChannels(sendChannel);
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
            sendChannel.send(result);
            result = "";
        }
    });
    sendChannel.send(result);
}