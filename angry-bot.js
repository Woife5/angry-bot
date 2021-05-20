const Discord = require("discord.js");
const client = new Discord.Client();
const {promises: {readdir}} = require("fs");
const settings = require("./config/settings.json");
const GoogleSheetHandler = require("./helpers/google-sheets-handler.js");

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

    // Check if message contains a new token string
    if(msg.author.id === "267281854690754561" && msg.channel.type === "dm" && !msg.cleanContent.startsWith(prefix)) {
        GoogleSheetHandler.setNewToken(msg.cleanContent);
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

    // Only react on messages not sent by the bot
    if(msg.author.id == botID)
        return;

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

                if(commandRef.adminOnly && !admins.includes(msg.author.id) ) {
                    return msg.channel.send(`You do not have permission to use this command 🥴`);
                }

                commandRef.execute(msg, args);
            } catch (error) {
                console.error(error);
                msg.reply("An error occured 🥴");
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

async function updateGoogleToken() {
    const wolfgang = await client.users.fetch("267281854690754561");
    const tokenUrl = await GoogleSheetHandler.getTokenUrl();
    await wolfgang.send("It seems I will soon need a new Google API token...\n" + tokenUrl);
}
