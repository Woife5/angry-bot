# Angry Bot

`Version 4.0.3`

A discord bot that reacts on every message with a set amount of angry emojis (5 currently).

You can find the bot on the original and official Angry Discord Server:

[https://discord.gg/pZrBRA75wz](https://discord.gg/pZrBRA75wz "Official Angry Discord")

## Commands

Command | Description
--- | ---
`?angry help`| Get a list of all possible commands and a short description
`?angry tarot`| Get a reading of you angry tarot. You can use this command once per day.
`?angry stats`| Get all current global bot stats.
`?angry tarotcount`| Get the number of angry tarots the bot has read so far.
`?angry count `| Get the number of angry reactions the bot has added to messages so far. Only angry reactions are counted.
`?angry emojilist`| Get a list of all angry emojis on the Discord Server and how often every single one has been used.
`?angry topspammer`| Get a list of all Discord Server members and how many angry emojis they have sent on the Server.
`?angry censored`| Get a list of all emojis and strings that are censored

## Other functions of this bot

### Stat tracker
Every day at midnight the bot saves all global stats to [this Google Sheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vS-jr33D0n-QClwWn9TmhY51st3vJufZDZZyaNCZ1bmcVEEDCkG924exDYddWAn5ETf7Yi2LnqhlJEJ/pubhtml?gid=490395045&single=true "Angry-Bot-Stats"). These include Total Angry-reactions by the bot, Angry-Tarots read, roman mentions and messages cencored. Also included is user-specific data and how often every tarot has been read so far. The date refers to the stat at the start of the day (00:00).

### Reactions
Every message sent will be reacted angry. The amount of angry reactions can be set from 0 to 20.

### Custom Reactions and replys
Every user can request a cutom angry reaction or reply. These custom reactions are stored in `custom-reactions.json`. This file can be reloaded dynamically while the bot is running without interruption. 

### Angry Emoji Cencorship
If any user sends a normal angry emoji the bot will censor the message. The list of emojis to be censored can be altered by admins.

## Admin Commands
Command | Description
--- | ---
`?angry censorship`| Add or remove a String(Emoji) from the list of censored emojis.