const { getRandomInt } = require("../helpers/helper-functions.js")
const fetch = require("node-fetch");
const bibleAPI = "https://getbible.net/v2/elberfelder/";
const numberOfBooks = 66;

module.exports = {
    name: "bibleverse",
    description: "Get a random bible verse. Optionally a book, chapter and verse can ge provided via arguments to get a specific verse.",
    adminOnly: true,
    hidden: true,
    usage: "<?book> <?chapter> <?verse>",
    async execute(msg, args) {
        return;
        // This command is still in development and not active.
        // adminOnly and hidden will be removed later as well as this return.
        
        let bookNR = null;
        let book = null;

        // Check if we got a valid book
        if(args.length > 0) {
            let tempBook = parseInt(args[0]);
            if(!isNaN(tempBook) && tempBook > 0 && tempBook <= numberOfBooks) {
                bookNR = tempBook;
            } else {
                //TODO send error message: book not valid
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

        if(args.length > 1) {
            let tempChapter = parseInt(args[1]);
            if(!isNaN(tempChapter) && tempChapter > 0) {
                // check if the chapter is valid for the book

                if(book.chapters.length >= tempChapter) {
                    chapterNR = tempChapter;
                } else {
                    //TODO send error message: chapter not valid
                }
            } else {
                // TODO send error message: wrong chapterNR input
            }
        } else {
            // Get a random chapter
            chapterNR = getRandomInt(1, book.chapters.length);
        }

        // Get the requested chapter
        chapter = book.chapters[chapterNR-1];
        let verseNR = null;
        let verseText = null;

        if(args.length > 2) {
            let tempVerse = parseInt(args[2]);
            if(!isNaN(tempVerse) && tempVerse > 0) {
                // check if the verse is valid for the chapter

                if(chapter.verses.length >= tempVerse) {
                    verseNR = tempVerse;
                } else {
                    //TODO send error message: verse not valid
                }
            }
        } else {
            // Get a random verse
            verseNR = getRandomInt(1, chapter.verses.length);
        }

        verseText = chapter.verses[verseNR-1].text;

        // 1. Get a random verse from the Bible
        // TODO 2. Change some words for others
        // TODO 3. Send the new verse
        // 4. add the ability to request a specific book/chapter/verse
        // TODO 5. Handle faulty inputs
        // TODO pls dont judge me for this f***ing mess ^^
    }
};