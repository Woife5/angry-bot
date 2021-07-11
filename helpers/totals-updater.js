const StatHandler = require("../helpers/stat-handler.js");
const { botID } = require("../config/bot-constants.json");

let allowLeaderboardCommand = true;

/**
 * This function takes a dicord channel as argument and returns all found messages as an array
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

/**
 * This function takes a dicord channel as argument and returns all new messages as an array
 * @param {Channel} channel The channel that should be scraped
 * @param {Number} after The ID of the message after which all messages should be scraped
 * @returns An array containing all messages after the given message
 */
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

module.exports = {
    async updateTotalsForAllChannels(sendChannel) {
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
                try {
                    allMessages = await new_messages_getter(channel, lastMessageId);
                } catch (error) {
                    console.error(error);
                    console.error("Ignoring this channel for now...");
                }
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
}