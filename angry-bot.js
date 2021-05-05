const Discord = require("discord.js");
const fetch = require("node-fetch");
const client = new Discord.Client();
const Cache = require("./cache.js");
const {promises: {readFile, writeFile}} = require("fs");

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
 * Api location of the database handler
 */
const apiUrl = "http://wolfberry:88/api/";

/**
 * Allow any user to issue a command that searches through every message on the server
 */
let allowLeaderboardCommand = true;

/**
 * Remember the daily angry emoji of all server users
 */
let angryTarot = {};
let angryTarotTexts;
const angryTarotCacheFile = "angry-tarot-cache.json";

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
];

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus("online");
    client.user.setActivity(`"${prefix}"`, {type: "LISTENING"});
});

// Read settings file and login client if successful
readFile("settings.json").then(fileBuffer => {
    const settings = JSON.parse(fileBuffer.toString());
    client.login(settings["client-secret"]);
}).catch(error => {
    console.error("Error reading File: " + error.message);
    process.exit(1);
});

// Read angry tarot texts into an array
readFile("angry-tarot.json").then(fileBuffer => {
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
            }

            if(command === "updatereactions") {
                updateCustomReactions();
            }

            if(command === "loadtarot") {
                loadCachedTarots();
                msg.channel.send("I have successfully loaded all saved tarots");
            }
        }

        if(!command) {
            let commands = "Possible Commands:\n";
            commands += "`" + prefix + " tarot` - Get your daily angry\n";
            commands += "`" + prefix + " tarotcount` - See the number tarots I have read\n";
            commands += "`" + prefix + " count` - Get total amount of angry reactions\n";
            commands += "`" + prefix + " emojilist` - Get top angry emojis\n";
            commands += "`" + prefix + " topspammer` - Get top angry spammers\n";

            if(msg.author.id === "267281854690754561" || msg.author.id === "138678366730452992" || msg.author.id === "351375977303244800") {
                commands += "\nAdmin Commands:\n";
                commands += "`" + prefix + " flushtarot` - Remove all currently saved tarot emojis\n";
                commands += "`" + prefix + " loadtarot` - Load tarot from cache file\n";
                commands += "`" + prefix + " updatereactions` - Update the internal cache of custom angry reactions\n";
            }

            msg.channel.send(commands);
        }else if(command === "tarot") {
            // Get random angry emoji and store it for this user
            if(angryTarot[msg.author.id] && angryTarot[msg.author.id].isValid()) {
                msg.reply(`I already told you, your angry today is ${angrys[angryTarot[msg.author.id].getData()]}.\n${angryTarotTexts[angryTarot[msg.author.id].getData()]}\n\nYou can get a new one tomorrow (in ${angryTarot[msg.author.id].getTimeLeftMin()} Minutes).`);
            } else {
                // Assign a new random daily angry emoji
                let dailyAngry = Math.floor(Math.random() * angrys.length);
                angryTarot[msg.author.id] = new Cache(dailyAngry, (new Date().setHours(24,0,0,0) - Date.now()));
                incrementTarotCounter();

                msg.reply(`Let me sense your angry...`);
                setTimeout(() => {
                    msg.reply(`Your angry today is angry${dailyAngry+1} ${angrys[dailyAngry]}\n\n${angryTarotTexts[dailyAngry]}`);
                }, 2000);
                writeFile(angryTarotCacheFile, JSON.stringify(angryTarot))
                    .catch((err) => {
                        console.error("Writing cache failed: " + JSON.stringify(err));
                    });
            }
        }else if(command === "count") {
            getAngryCount()
                .then((amount) => {
                    msg.channel.send(`I have reacted angry ${amount.toLocaleString("de-AT")} times. ${angrys[0]}`);
                }).catch((err) => {
                    msg.channel.send(`Oups, something went wrong x.x ${angrys[0]}`);
                    console.error(err);
                });
        }else if(command === "tarotcount") {
            getTarotCount()
                .then((amount) => {
                    msg.channel.send(`I have read angry tarots ${amount.toLocaleString("de-AT")} times.`);
                }).catch((err) => {
                    msg.channel.send(`Oups, something went wrong x.x ${angrys[0]}`);
                    console.error(err);
                });
        }else if(command === "emojilist") {
            if(allowLeaderboardCommand) {
                allowLeaderboardCommand = false;
                rankAngryEmojis(msg.channel);
                msg.channel.send("Let me search through all messages real quick...");
            } else {
                msg.reply(`I am still working on the last one ${angrys[0]}`);
            }
        }else if(command === "topspammer") {
            if(allowLeaderboardCommand) {
                allowLeaderboardCommand = false;
                rankAngrySpammers(msg.channel);
                msg.channel.send("Let me search through all messages real quick...");
            } else {
                msg.reply(`I am still working on the last one ${angrys[0]}`);
            }
        }else {
            msg.reply(`That is not a command i know of 🥴`);
        }
    }
    //*/

    //* Be extra angry if divotkey is mentioned
    if(msg.cleanContent.toLocaleLowerCase().includes("roman") || msg.cleanContent.toLocaleLowerCase().includes("divotkey"))
    {
        msg.reply(`AAAAH ROMAN! ${angrys[0]} ${angrys[0]} ${angrys[0]}`);
        msg.channel.send(":clock10: :rolling_eyes:");
    }
    //*/

    // Check if custom reactions need to be applied
    if(msg.author.id in customAngrys) {
        const custom  = customAngrys[msg.author.id];
        addReactions(msg, custom.reactions);
        if(custom.reply) {
            msg.reply(custom.reply);
        }
        incrementAngryCounter(custom.angrys);
        return;
    }

    // React every message with the set amount of angrys
    for (let i = 0; i < angryAmount; i++) {
        msg.react(angrys[i]);
    }
    incrementAngryCounter(angryAmount);
});

//******************************************************
//                 HELPER FUNCTIONS
//******************************************************

/**
 * Updates (increments) the total angry reactions counter in MongoDB.
 * @param {Number} amount Number of angry reactions to be added to the counter
 */
function incrementAngryCounter(amount) {
    const body = `{"amount":${amount}}`;
    fetch(apiUrl + "angry-count", {
        "method": "POST",
        "body": body,
        "headers": { 
            "Content-Type": "application/json",
            "Content-Length": body.length,
        },
    }).catch((err) => console.error(err));
}

/**
 * Updates (increments) the total angry tarot reading counter in MongoDB
 * @param {Number} amount Amount of Angry tarots that should be incremented, default 1
 */
function incrementTarotCounter(amount = 1) {
    const body = `{"amount":${amount}}`;
    fetch(apiUrl + "angry-tarot-count", {
        "method": "POST",
        "body": body,
        "headers": { 
            "Content-Type": "application/json",
            "Content-Length": body.length,
        },
    }).catch((err) => console.error(err));
}

/**
 * Sends the number of total angry emojis sent on the server to the server api
 * @param {Number} amount The amount of total angry emojis sent
 */
async function updateTotalAngryEmoji(amount) {
    const body = `{"amount":${amount}}`;
    fetch(apiUrl + "angry-emoji-count", {
        "method": "POST",
        "body": body,
        "headers": { 
            "Content-Type": "application/json",
            "Content-Length": body.length,
        },
    }).catch((err) => console.error(err));
}

/**
 * Returns the total number of angry reactions done by the bot
 * @returns A Promise containing the toal amount of angry reactions by the bot
 */
function getAngryCount() {
    let promise = new Promise((resolve, reject) => {
        fetch(apiUrl + "angry-count")
            .then(res => res.json())
            .then(json => {
                resolve(json.angryCount);
            }).catch((err) => {
                reject(err);
            });
    });
    return promise;
}

/**
 * Returns the total number of angry tarots read by the bot
 * @returns A Promise containing the total amount of angry tarots read by the bot
 */
function getTarotCount() {
    let promise = new Promise((resolve, reject) => {
        fetch(apiUrl + "angry-tarot-count")
            .then(res => res.json())
            .then(json => {
                resolve(json.angryTarotCount);
            }).catch((err) => {
                reject(err);
            });
    });
    return promise;
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

        sum_messages.push(...messages.array());
        last_id = messages.last().id;

        if (messages.size != 100) {
            break;
        }
    }

    return sum_messages;
}

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
    readFile("custom-reactions.json").then(fileBuffer => {
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
            const keys = Object.keys(data);
            angryTarot = {};

            for(let i = 0; i < keys.length; i++) {
                const obj = data[keys[i]];
                if(obj.lastUpdate < new Date().setHours(24,0,0,0))
                    angryTarot[keys[i]] = new Cache(obj.data, (new Date().setHours(24,0,0,0) - Date.now()));
            }

            console.log("All tarots have been loaded again.");
        }).catch(err => {
            console.error("Error reading tarot cache: " + JSON.stringify(err));
        });
}

async function rankAngryEmojis(sendChannel) {
    let totalAngryEmoji = 0;
    let emojiCounter = {};
    let channelAmount = sendChannel.guild.channels.cache.array().length;
    let channelCounter = 0;
    sendChannel.guild.channels.cache.forEach((channel) => {
        if(channel.type === "text"){
            all_messages_getter(channel).then(allMessages => {
                allMessages.forEach((message) => {
                    // Only check message if it was not sent by the bot
                    if(message.content && message.author.id !== botID) {
                        angrys.forEach(angry => {
                            if(message.content.includes(angry)) {
                                const regex = new RegExp(angry, "g");
                                let count = (message.content.match(regex) || []).length;
                                totalAngryEmoji += count;
                                // Angry found
                                if(emojiCounter[angry]) {
                                    emojiCounter[angry] += count;
                                } else {
                                    emojiCounter[angry] = count;
                                }
                            }
                        });
                    }
                });
                channelCounter++;
            }).finally(() => {
                if(channelCounter >= channelAmount) {
                    let result = "";
                    for (let i = 0; i < angrys.length; i++) {
                        result += ":angry" + (i+1) + ": sent " + emojiCounter[angrys[i]] + " times\n";
                    }
                    result += `A total of ${totalAngryEmoji} angry Emojis have been sent here.\n`;
                    sendChannel.send(result);
                    updateTotalAngryEmoji(totalAngryEmoji);
                    allowLeaderboardCommand = true;
                }
            });
        } else {
            channelCounter++;
        }
    });
}

async function rankAngrySpammers(sendChannel) {
    let totalAngryEmoji = 0;
    let spammerCounter = {};
    let channelAmount = sendChannel.guild.channels.cache.array().length;
    let channelCounter = 0;
    sendChannel.guild.channels.cache.forEach((channel) => {
        if(channel.type === "text"){
            all_messages_getter(channel).then(allMessages => {
                allMessages.forEach((message) => {
                    // Only check message if it was not sent by the bot
                    if(message.author.id !== botID) {
                        if(message.content.includes("angry")) {
                            const regex = new RegExp("<:angry[0-9]{1,2}:[0-9]+>", "g");
                            let count = (message.content.match(regex) || []).length;
                            totalAngryEmoji += count;
                            let sender = message.author.username;
                            // Angry found
                            if(spammerCounter[sender]) {
                                spammerCounter[sender] += count;
                            } else {
                                spammerCounter[sender] = count;
                            }
                        }
                    }
                });
                channelCounter++;
            }).finally(() => {
                if(channelCounter >= channelAmount) {
                    let spammerRanking = [];
                    let spammerNames = Object.keys(spammerCounter);
                    for (let i = 0; i < spammerNames.length; i++) {
                        const spammerObj = {
                            "name": spammerNames[i],
                            "angrys": spammerCounter[spammerNames[i]],
                        };
                        spammerRanking.push(spammerObj);
                    }
                    spammerRanking.sort((a, b) => {
                        return b.angrys - a.angrys;
                    });

                    let result = "";
                    spammerRanking.forEach((spammer) => {
                        result += `${spammer.name} sent ${spammer.angrys} angrys.\n`;
                    });
                    result += `A total of ${totalAngryEmoji} angry Emojis have been sent here.\n`;
                    sendChannel.send(result);
                    updateTotalAngryEmoji(totalAngryEmoji);
                    allowLeaderboardCommand = true;
                }
            });
        } else {
            channelCounter++;
        }
    });
}