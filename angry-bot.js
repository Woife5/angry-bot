const Discord = require("discord.js");
const fetch = require("node-fetch");
const client = new Discord.Client();
const Cache = require("./cache.js");
const {promises: {readFile}} = require("fs");

/**
 * Prefix for all angry-commands
 */
const prefix = "?angry";

/**
 * Unique ID of the Angry Bot user
 */
const botID = "824235133284253736";

/**
 * Allow any user to issue a command that searches through every message on the server
 */
let allowLeaderboardCommand = true;

/**
 * Amount of angry reactions per message
 */
const angryAmount = 5;

/**
 * Remember the daily angry emoji of all server users
 */
 let angryTarot = {};

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


client.on("message", (msg) => {

    // Only react on messages not sent by the bot
    if(msg.author.id != botID)
    {
        //* Handle commands
        if(msg.content.startsWith(prefix)) {
            // Message is a command
            const args = msg.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if(!command) {
                let commands = "Possible Commands:\n";
                commands += "`" + prefix + " tarot` - Get your daily angry\n";
                commands += "`" + prefix + " count` - Get total amount of angry reactions\n";
                commands += "`" + prefix + " emojilist` - Get top angry emojis\n";
                commands += "`" + prefix + " topspammer` - Get top angry spammers\n";

                if(msg.author.id === "267281854690754561" || msg.author.id === "138678366730452992" || msg.author.id === "351375977303244800") {
                    commands += "`" + prefix + " flushtarot` - Remove all currently saved tarot emojis\n";
                }

                msg.channel.send(commands);
            }

            if(command === "tarot") {
                // Get random angry emoji and store it for this user
                if(angryTarot[msg.author.id] && angryTarot[msg.author.id].isValid()) {
                    msg.reply(`I already told you, your angry today is ${angryTarot[msg.author.id].getData()}. You can get a new one tomorrow (in ${angryTarot[msg.author.id].getTimeLeftMin()} Minutes).`);
                } else {
                    // Assign a new random daily angry emoji
                    let dailyAngry = Math.floor(Math.random() * angrys.length);
                    angryTarot[msg.author.id] = new Cache(angrys[dailyAngry], (new Date().setHours(24,0,0,0) - Date.now()));

                    msg.reply(`Let me sense your angry...`);
                    setTimeout(() => {
                        msg.reply(`Your angry today is angry${dailyAngry+1} ${angrys[dailyAngry]}`);
                    }, 2000);
                }
            }

            if(msg.author.id === "267281854690754561" || msg.author.id === "138678366730452992" || msg.author.id === "351375977303244800") {
                if(command === "flushtarot") {
                    angryTarot = {};
                    msg.channel.send("All saved Tarots have been cleared!");
                }
            }

            if(command === "count") {
                getAngryCounter()
                    .then((amount) => {
                        msg.channel.send(`I have reacted angry ${amount.toLocaleString("de-AT")} times. ${angrys[0]}`);
                    }).catch((err) => {
                        msg.channel.send(`Oups, something went wrong x.x ${angrys[0]}`);
                        console.error(err);
                    });
            }

            if(command === "emojilist") {
                if(allowLeaderboardCommand) {
                    allowLeaderboardCommand = false;
                    rankAngryEmojis(msg.channel);
                } else {
                    msg.reply(`I am still working on the last one ${angrys[0]}`);
                }
            }

            if(command === "topspammer") {
                if(allowLeaderboardCommand) {
                    allowLeaderboardCommand = false;
                    rankAngrySpammers(msg.channel);
                } else {
                    msg.reply(`I am still working on the last one ${angrys[0]}`);
                }
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

        //* React with WOLFI when its me lol
        if(msg.author.id === "267281854690754561")
        {
            msg.react(angrys[0])
                .then(() => msg.react("🇼"))
                .then(() => msg.react("🇴"))
                .then(() => msg.react("🇱"))
                .then(() => msg.react("🇫"))
                .then(() => msg.react("🇮"))
                .then(() => msg.react(angrys[1]))
                .catch(() => console.error("One reaction failed!"));
                incrementAngryCounter(2);
            return;

        }
        //*/

        //* React with FELIX when its felix
        if(msg.author.id === "138678366730452992")
        {
            msg.react(angrys[0])
                .then(() => msg.react("🇫"))
                .then(() => msg.react("🇪"))
                .then(() => msg.react("🇱"))
                .then(() => msg.react("🇮"))
                .then(() => msg.react("🇽"))
                .then(() => msg.react(angrys[1]))
                .catch(() => console.error("One reaction failed!"));
                incrementAngryCounter(2);
            return;
        }
        //*/

        //* React with LUMI when its pauli
        if(msg.author.id === "297031236860510208")
        {
            msg.react(angrys[0])
                .then(() => msg.react("🇱"))
                .then(() => msg.react("🇺"))
                .then(() => msg.react("🇲"))
                .then(() => msg.react("🇮"))
                .then(() => msg.react(angrys[1]))
                .catch(() => console.error("One reaction failed!"));
            incrementAngryCounter(2);
            return;
        }
        //*/
        
        //* React with LAURA when its laura
        if(msg.author.id === "630465849270075402")
        {
            msg.react(angrys[0])
                .then(() => msg.react("🇱"))
                .then(() => msg.react("🇦"))
                .then(() => msg.react("🇺"))
                .then(() => msg.react("🇷"))
                .then(() => msg.react("🅰️"))
                .then(() => msg.react(angrys[1]))
                .catch(() => console.error("One reaction failed!"));
                incrementAngryCounter(2);
            return;
        }
        //*/

        //* React with TOBI when its tobi
        if(msg.author.id === "638705859123216394")
        {
            msg.react(angrys[0])
                .then(() => msg.react("🇹"))
                .then(() => msg.react("🇴"))
                .then(() => msg.react("🇧"))
                .then(() => msg.react("🇮"))
                .then(() => msg.react(angrys[1]))
                .catch(() => console.error("One reaction failed!"));
            incrementAngryCounter(2);
            return;
        }
        //*/

        //* React custom when its ramoni
        if(msg.author.id === "214725217967144960")
        {
            msg.react(angrys[0])
                .then(() => msg.react("🌻"))
                .then(() => msg.react("👑"))
                .then(() => msg.react(angrys[1]))
                .catch(() => console.error("One reaction failed!"));
            incrementAngryCounter(2);
            return;
        }
        //*/

        //* React with cookie angry when its jojo
        if(msg.author.id === "656443344486006795")
        {
            msg.react(angrys[0])
                .then(() => msg.react("🍪"))
                .then(() => msg.react(angrys[1]))
                .catch(() => console.error("One reaction failed!"));
            incrementAngryCounter(2);
            return;
        }
        //*/
        
        //* React with Tintenfisch when its valentin
        if(msg.author.id === "351375977303244800")
        {
            msg.react("🦑")
                .then(() => msg.react(angrys[0]))
                .then(() => msg.react(angrys[1]))
                .then(() => msg.react(angrys[2]))
                .catch(() => console.error("One reaction failed!"));
            msg.reply(`Tintenfisch ${angrys[0]}`);
            incrementAngryCounter(3);
            return;
        }
        //*/

        //* React every message with 5 angrys if the bot is angry
        for (let i = 0; i < angryAmount; i++) {
            msg.react(angrys[i]);
        }
        incrementAngryCounter(angryAmount);
        //*/
    }
});

//******************************************************
//                 HELPER FUNCTIONS
//******************************************************

function incrementAngryCounter(amount) {
    const body = `{"amount":${amount}}`;
    fetch("http://wolfberry:88/api/angry-count", {
        "method": "POST",
        "body": body,
        "headers": { 
            "Content-Type": "application/json",
            "Content-Length": body.length,
        },
    }).catch((err) => console.error(err));
}

async function updateTotalAngryEmoji(amount) {
    const body = `{"amount":${amount}}`;
    fetch("http://wolfberry:88/api/angry-emoji-count", {
        "method": "POST",
        "body": body,
        "headers": { 
            "Content-Type": "application/json",
            "Content-Length": body.length,
        },
    }).catch((err) => console.error(err));
}

function getAngryCounter() {
    let promise = new Promise((resolve, reject) => {
        fetch("http://wolfberry:88/api/angry-count")
            .then(res => res.json())
            .then(json => {
                resolve(json.angryCount);
            }).catch((err) => {
                reject(err);
            });
    });
    return promise;
}

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