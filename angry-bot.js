const Discord = require("discord.js");
const client = new Discord.Client();
const {promises: {readFile, writeFile}} = require("fs");
const settings = require("./config/settings.json");

const Stats = require("./helpers/stat-handler.js");
const StatHandler = new Stats();

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
 * Remember the daily angry emoji of all server users
 */
let angryTarot = {};
let angryTarotTexts;

/**
 * All relevant File locations
 */
const angryTarotCacheFile = "./stats-and-cache/angry-tarot-cache.json";
const customReactionsFile = "./config/custom-reactions.json";
const angryTarotFile = "./config/angry-tarot.json";

/**
 * An object containing all custom reactions that can be updated while the bot is running
 */
let customAngrys;

/**
 * A list of all angry emojis on the official angry discord: https://discord.gg/pZrBRA75wz
 */
 const angrys = [
    "<:angry1:824231077588762634>",
    "<:angry2:824231091556188170>",
    "<:angry3:824231102725488640>",
    "<:angry4:824231112715796491>",
    "<:angry5:824231123298025502>",
    "<:angry6:824231131813511179>",
    "<:angry7:824231141149507594>",
    "<:angry8:824231151417688085>",
    "<:angry9:824231161710247937>",
    "<:angry10:824231171352297512>",
    "<:angry11:824231180332957706>",
    "<:angry12:824231190382510160>",
    "<:angry13:824231201056882768>",
    "<:angry14:824231213773881374>",
    "<:angry15:824231223119314984>",
    "<:angry16:824231231193350215>",
    "<:angry17:824231239950270465>",
    "<:angry18:824231250125520897>",
    "<:angry19:824231259386544180>",
    "<:angry20:824231267867688961>",
    "<:angry21:824231278504443974>",
    "<:angry22:824231287627186176>",
    "<:angry23:824231298444165190>",
    "<:angry24:824231308024610836>",
    "<:angry25:824231316551368715>",
    "<:angry26:824231326013194240>",
    "<:angry27:824231335727071272>",
    "<:angry28:824231344930422855>",
    "<:angry29:824231353310511104>",
    "<:angry30:824231364106780682>",
    "<:angry31:824231373199769610>",
    "<:angry32:824231382434840596>",
    "<:angry33:824231392094715905>",
    "<:angry34:824231400504033311>",
    "<:angry35:824231408591437844>",
    "<:angry36:824231416450515025>",
    "<:angry37:824231425191968780>",
    "<:angry38:824231434553131049>",
    "<:angry39:824231442003132417>",
    "<:angry40:824231451569553409>",
    "<:angry41:824231460109025290>",
    "<:angry42:824231469249331220>",
    "<:angry43:824231478216228864>",
    "<:angry44:824231487837831168>",
    "<:angry45:824231497724067902>",
    "<:angry46:824231506780094464>",
    "<:angry47:824231519962398751>",
    "<:angry48:824231527382384671>",
    "<:angry49:840157523319455746>",
    "<:angry50:840157593791102996>",
    "<:angry51:840157794426814464>",
    "<:angry52:840157804961595392>",
    "<:angry53:840157818825080832>",
    "<:angry54:840157829448335370>",
    "<:angry55:840157840677273611>",
    "<:angry56:840157855780044800>",
    "<:angry57:840157867730534421>",
    "<:angry58:840157882741162035>",
    "<:angry59:840157896184168458>",
    "<:angry60:840157906074861589>",
    "<:angry61:840157916719480872>",
    "<:angry62:840157926761168937>",
    "<:angry63:840157937192009779>",
    "<:angry64:840157946632863756>",
    "<:angry65:840157956493279303>",
    "<:angry66:840157964748587048>",
    "<:angry67:840157973404975104>",
    "<:angry68:840157984436518942>",
    "<:angry69:840157994389995541>",
    "<:angry70:840158003671203840>",
    "<:angry71:840158024504311869>",
    "<:angry72:840158036991148032>",
    "<:angry73:840158045090086933>",
    "<:angry74:840158054518751253>",
    "<:angry75:840158063885680640>",
    "<:angry76:840158072621498398>",
    "<:angry77:840158081786314792>",
    "<:angry78:840158089760342016>",
    "<:angry79:840158098996068352>",
    "<:angry80:840158107321237514>",
    "<:angry81:840158115391471635>",
    "<:angry82:840158123524227092>",
    "<:angry83:840158132605026334>",
    "<:angry84:840158140615884800>",
    "<:angry85:840158149989498901>",
    "<:angry86:840158160487579689>",
    "<:angry87:840158170751696936>",
    "<:angry88:840158181502353439>",
    "<:angry89:840158191316893716>",
    "<:angry90:840158200401363005>",
    "<:angry91:840158212245422090>",
    "<:angry92:840158221594787894>",
    "<:angry93:840158230717792257>",
    "<:angry94:840158239857442817>",
    "<:angry95:840158249079930891>",
    "<:angry96:840158258337021952>",
    "<:angry97:840158268629188610>",
    "<:angry98:840158277324636161>",
    "<:angry99:840158287331721255>",
    "<:angry100:840158298429980683>",
];

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus("online");
    client.user.setActivity(`"${prefix}"`, {type: "LISTENING"});
});

client.login(settings["client-secret"]);

// Read angry tarot texts into an array
readFile(angryTarotFile).then(fileBuffer => {
    angryTarotTexts = JSON.parse(fileBuffer.toString());
}).catch(error => {
    console.error("Error reading File: " + error.message);
    process.exit(1);
});

// Read custom config from fs while bot is starting
loadCachedTarots();
updateCustomReactions();

client.on("message", (msg) => {

    // Only react on messages not sent by the bot
    if(msg.author.id == botID)
        return;

    //* Handle commands
    if(msg.content.startsWith(prefix)) {
        // Message is a command
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

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
                updateTotalsForAllChannels(msg.channel);
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
        }else if(command === "tarot") {

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
                const dailyAngry = Math.floor(Math.random() * angrys.length);
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
        }else if(command === "count") {
            // Get amount of angry reactions
            const amount = StatHandler.getStat(StatHandler.BOT_ANGRY_REACTIONS);
            msg.channel.send(`I have reacted angry ${amount.toLocaleString("de-AT")} times. ${angrys[0]}`);
        }else if(command === "tarotcount") {
            // Get amount of tartots read
            const amount = StatHandler.getStat(StatHandler.TAROTS_READ);
            msg.channel.send(`I have read angry tarots ${amount.toLocaleString("de-AT")} times.`);
        }else if(command === "emojilist") {
            // Get list of all emojis
            rankAngryEmojis(msg.channel);
        }else if(command === "topspammer") {
            // Get top spammer
            rankAngrySpammers(msg.channel);
        }else if(command === "myemojilist") {
            // Get list of all emojis by this user
            rankAngryEmojis(msg.channel, msg.author.id);
        }else if(command === "stats") {
            const angryReactions = StatHandler.getStat(StatHandler.BOT_ANGRY_REACTIONS);
            const tarotsRead = StatHandler.getStat(StatHandler.TAROTS_READ);
            const romanMentions = StatHandler.getStat(StatHandler.DIVOTKEY_REACTIONS);
            const cencorships = StatHandler.getStat(StatHandler.TIMES_CENCORED);

            let result = `I have reacted angry ${angryReactions.toLocaleString("de-AT")} times.\n`;
            result += `I have read ${tarotsRead.toLocaleString("de-AT")} angry tarots.\n`;
            result += `Roman has been mentioned ${romanMentions.toLocaleString("de-AT")} times.\n`;
            result += `A total of ${cencorships.toLocaleString("de-AT")} messages have been cencored.\n`;

            msg.channel.send(result);
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


        msg.reply(cencoredContent + "\nThat is illegal!");
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
 * Loads all saved tarots from cache file
 */
function loadCachedTarots() {
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