# Angry Bot

`Version 3.1.2`

A discord bot that reacts on every message with a set amount of angry emojis (5 currently).

You can find the bot on the original and official Angry Discord Server:

[https://discord.gg/pZrBRA75wz](https://discord.gg/pZrBRA75wz "Official Angry Discord")

## Commands

Command | Description
--- | ---
`?angry`| Get a list of all possible commands and a short description
`?angry tarot`| Get a reading of you angry tarot. You can use this command once per day.
`?angry stats`| Get all current global bot stats.
`?angry tarotcount`| Get the number of angry tarots the bot has read so far.
`?angry count `| Get the number of angry reactions the bot has added to messages so far. Only angry reactions are counted.
`?angry emojilist`| Get a list of all angry emojis on the Discord Server and how often every single one has been used.
`?angry myemojilist`| Get a list of your top used angry emojis on the Discord Server.
`?angry topspammer`| Get a list of all Discord Server members and how many angry emojis they have sent on the Server.

## Other functions of this bot

### Stat tracker
Every day at midnight the bot saves all global stats to [this Google Sheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vS-jr33D0n-QClwWn9TmhY51st3vJufZDZZyaNCZ1bmcVEEDCkG924exDYddWAn5ETf7Yi2LnqhlJEJ/pubhtml?gid=490395045&single=true "Angry-Bot-Stats"). These include Total Angry-reactions by the bot, Angry-Tarots read, roman mentions and messages cencored. The date refers to the stat at the start of the day (00:00).

### Reactions
Every message sent will be reacted angry. The amount of angry reactions can be set from 0 to 20.

### Custom Reactions and replys
Every user can request a cutom angry reaction or reply. These custom reactions are stored in `custom-reactions.json`. This file can be reloaded dynamically while the bot is running without interruption. 

### Angry Emoji Cencorship
If any user send a normal angry emoji (😠😡🤬) in any channel, the bot will remove the message and state that these things are cencored.

## Admin Commands
Command | Description
--- | ---
`?angry flushtarot`| Remove all currently saved tarots from the bot's internal cache. This does not affect the cache file.
`?angry loadtarot`| Load the last saved state of angry tarots. Everytime a tarot is requested the server writes all tarot data to a file. This file is loaded on server restart and can be laoded manually with this command.
`?angry updatereactions`| Update the local cache of custom angry reactions the bot knows. This data is read from the file *custom-reactions.json*