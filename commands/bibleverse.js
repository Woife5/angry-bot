const { getRandomInt } = require("../helpers/helper-functions.js");
const fetch = require("node-fetch");
const bibleAPI = "https://getbible.net/v2/elberfelder/";
const numberOfBooks = 66;

module.exports = {
    name: "bibleverse",
    description:
        "Get a random bible verse. Optionally a book, chapter and verse can be provided via arguments to get a specific verse. Usage: `?angry bibleverse <?book> <?chapter> <?verse>`",
    adminOnly: false,
    hidden: false,
    usage: "<?book> <?chapter> <?verse>",
    async execute(msg, args) {
        let bookNR = null;
        let book = null;

        // Check if we got a valid book
        if (args.length > 0) {
            let tempBook = parseInt(args[0]);
            if (!isNaN(tempBook) && tempBook > 0 && tempBook <= numberOfBooks) {
                bookNR = tempBook;
            } else {
                // Send error message: invalid book
                msg.reply("Invalid book number!");
                return;
            }
        } else {
            // Get a random book
            bookNR = getRandomInt(1, numberOfBooks);
        }

        // Download the requested book
        let result = await fetch(bibleAPI + bookNR + ".json");
        book = await result.json();
        let chapterNR = null;
        let chapter = null;

        if (args.length > 1) {
            let tempChapter = parseInt(args[1]);
            if (!isNaN(tempChapter) && tempChapter > 0) {
                // check if the chapter is valid for the book

                if (book.chapters.length >= tempChapter) {
                    chapterNR = tempChapter;
                } else {
                    // send error message: chapter not valid
                    msg.reply("Invalid chapter number!");
                    return;
                }
            } else {
                // send error message: wrong chapterNR input
                msg.reply("Invalid chapter number!");
                return;
            }
        } else {
            // Get a random chapter
            chapterNR = getRandomInt(1, book.chapters.length);
        }

        // Get the requested chapter
        chapter = book.chapters[chapterNR - 1];
        let verseNR = null;
        let verseText = null;

        if (args.length > 2) {
            let tempVerse = parseInt(args[2]);
            if (!isNaN(tempVerse) && tempVerse > 0) {
                // check if the verse is valid for the chapter

                if (chapter.verses.length >= tempVerse) {
                    verseNR = tempVerse;
                } else {
                    // send error message: verse not valid
                    msg.reply("Invalid verse number!");
                }
            }
        } else {
            // Get a random verse
            verseNR = getRandomInt(1, chapter.verses.length);
        }

        verseText = chapter.verses[verseNR - 1].text;

        // Replace some words in the text with some random others
        verseText = verseText.replaceAll("König", "Paul");
        verseText = verseText.replaceAll("Gott", "Paul");
        verseText = verseText.replaceAll("Christus", "Felix");
        verseText = verseText.replaceAll("Mose", "Valentin");
        verseText = verseText.replaceAll("Priester", "Roman");
        verseText = verseText.replaceAll("Diener", "Irmi");
        verseText = verseText.replaceAll("Jehovas", "Angrys");
        verseText = verseText.replaceAll("Jesu Christi", "Wolfgang Rader");
        verseText = verseText.replaceAll("Engel", "Axel");
        verseText = verseText.replaceAll("Sünder", "Thomas");
        verseText = verseText.replaceAll("Gottseligkeit", "Angrylosigkeit (a.k.a. Freude)");

        // Send the verse
        msg.channel.send(
            `${verseText}\n***${chapter.verses[verseNR - 1].name}*** \`(${bookNR} ${chapterNR} ${verseNR})\``
        );
    },
};
