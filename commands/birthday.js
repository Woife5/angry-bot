module.exports = {
    name: "birthday",
    description: "When is my birthday?",
    hidden: false,
    execute(msg) {
        const birthday = new Date("2021-03-24");
        while (birthday.getTime() < Date.now()) {
            birthday.setFullYear(birthday.getFullYear() + 1);
        }

        msg.channel.send(
            `My birthday is on ${birthday.toLocaleDateString("de-AT")} that means my next birthday is in ${Math.floor(
                (birthday.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )} days.`
        );
        msg.react("🎂");
    },
};
