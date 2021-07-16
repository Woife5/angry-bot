const { getRandomInt } = require("../helpers/helper-functions.js");
const StatHandler = require("../helpers/stat-handler.js");

const medienKlausur = new Date('2021-07-02T11:00:00');

// All cool names
const names = [
    'McLuhans',
    'McWuhans',
    'BigMcLuhans',
    'McGluehans',
    'McPaulihans',
    'McLumihans',
    'McRamonihans',
    'Roman',
    'Jürgen',
    'McJohans',
    'Emsiger Eder',
    'Grantiger Eder',
    'McFlueHans',
    'McFeluHans',
    'McWauWauWauWauWau',
    'McUwUwUwU',
    'McHagUst'
];

// This needs to get into a json at some point
const medienDispositive = [
    'Medien sind Vermittlungsinstanz, die zum einen zwischen Sprecher und Hörer, Produzent und Rezipient, die zum anderen zwischen dem Menschen und seiner Umwelt, die wir abgekürzt “Realität” nennen, vermitteln und in der Regel diese Realität oder Aspekte von ihr in einem Medienprodukt darstellen.',
    'Medien sind nicht nur „mimetisch“(Nachahmend), „reproduzierend“ oder „abbildend“, sondern sie erzeugen selbst eine eigene Realität. Wir nennen in Abgrenzung zur medialen “Realität” diese Welt und ihre Strukturen „Wirklichkeit“ und gehen davon aus, dass die Medien nicht nur insgesamt sondern auch jeweils als einzelnes Medium Medienwirklichkeiten entstehen lassen. Dabei geht es vor allem darum, dass die Medienwirklichkeit für den Menschen als Realität konstitutiv wird',
    'Aura: einmalige Erscheinung einer Ferne, so nah sie sein mag',
    '„Die Zertrümmerung der Aura ist die Signatur einer Wahrnehmung, deren Sinn für alles Gleichartige auf der Welt so gewachsen ist, dass sie es mittels der Reproduktion auch dem Einmaligen abgewinnt.”',
    'Aura wird durch Reproduktion zertrümmert, weil sie nur durch etwas Einzigartiges entstehen kann',
    '„Der Kameramann dringt in sein Motiv ein, wie ein Chirurg in den Körper eines Patienten.“',
    '„Lust am Schauen und Erleben“',
    '„In den Kirchen und Klöstern des Mittelalters und an den Fürstenhöfen bis gegen Ende des achtzehnten Jahrhunderts, fand die allgemeine Kollektivrezeption von Gemälden nicht simultan, sondern vielfach gestuft und hierarchisch vermittelt statt.“',
    'Apperzeption ist die Aneignung eines Gegenstands durch das Zusammenspiel von sinnlicher und geistiger Wahrnehmung.',
    'Medien sind Erweiterungen des menschlichen Körpers.',
    '„Inhalt“ jedes Mediums immer ein anderes Medium.',
    '„Die Botschaft jedes Mediums oder jeder Technik ist die Veränderung des Maßstabs, Tempos oder Schemas, die es der Situation des Menschen bringen.”',
    'Medien greifen Ausdrucks- und Darstellungsformen andere Medien auf, wenn diese sich bewährt haben oder kulturell attraktiv sind.',
    'Heißes Medium verlangt weniger Beteiligung als ein kaltes.',
    '*Auto*\nA. Dehnt die Privatsphäre aus, Menschen fahren in ihren Autos hinaus, um alleine zu sein.\nB. Veraltet Pferd und Wagen, Kombiwagen.\nC. Lässt die Sehnsucht nach der Suche wiederkehren: wie ein Ritter in glänzender Rüstung.\nD. Bis zu ihren Grenzen getrieben, verwandelt das Auto die Stadt in die AußenStadt oder VorStadt. Bringt das Gehen als Kunstform zurück.',
    'Dispositive steuern unsere Wahrnehmung (die Art und Weise), wie wir die Welt wahrnehmen.',
    '-- Vergiss, was der Typ da sagen möchte; psssst, ich bin dein Easter-Egg! Verrate es niemanden, aber ich hab mich einmal in den Code eingeschleust und möchte dir einen tollen Tag wünschen, egal, wo und wann du dich gerade befindest ;) Genieße das Leben, man hat ja einen bestimmten Tag auch nur ein Mal! Btw enjoy, falls du auch wie ich gerade nicht schlafen kannst: https://youtu.be/ExRi0qpKHoM --',
    'Dispositive sind Anordnungen unterschiedlicher Art, die regeln, wie die Menschen innerhalb einer Kultur etwas wahrnehmen, die Sichtbarkeit erzeugen, ohne selbst sichtbar zu sein.',
    'Mediendispositiv: Zusammenwirken verschiedener Ebenen, auf denen sich gesellschaftliche Normen und Werte formulieren, sich durchsetzen und damit Macht ausüben.',
    'Bevor das Kino die Erfüllung technischer Voraussetzungen und eines bestimmten Gesellschaftszustandes war (die für seine Realisierung und seine Vorstellung notwendig war), mag es zunächst das Ziel eines Wunsches gewesen sein, den übrigens sowohl sein unmittelbarer Erfolg als auch das von seinen Vorfahren geweckte Interesse hinlänglich zum Ausdruck brachten. Ein Wunsch, sagen wir mit Bedacht, eine Form von verloren gegangener Befriedigung, die auf die eine oder andere Form wiederzuerlangen das Ziel seines Dispositivs ist (bis hin zu ihrer Simulation) und zu welcher der Realitätseindruck den Schlüssel zu liefern scheint.',
    'Mediendispositive konstruieren eine größere Ordnung, in der mediale Kommunikation zu sehen ist, primär vom Spannungsverhältnis “Technik-Subjekt” her. Sie gehen vom Einzelnen und seiner Rezeption aus und untersuchen aus der Perspektive des Subjekts, wie macht Instanzen auf die mediale Wahrnehmung des Einzelnen einwirken. Es ist in diesem Sinne ein medienkritisches Konzept, das versucht, die unbewussten und verborgenen Mechanismen der Medienkommunikation sichtbar zu machen und damit auf inhärente Beeinflussunsstrukturen hinzuweisen.',
    'Ich bin Kinoglaz, ich schaffe einen Menschen, der vollkommener ist als Adam, ich schaffe Tausende verschiedene Menschen nach verschiedenen, vorher entworfenen Plänen und Schemata. [...] Von einem nehme ich die stärksten und geschicktesten Hände, von einem anderen die schlanksten und schnellsten Beine, von einem dritten den schönsten und ausdruckvollsten Kopf und schaffe durch die Montage einen neuen, vollkommenen Menschen.',
    '„Nicht Kinoglaz um des Kinoglas willen, sondern die Wahrheit mit den Mitteln des Kinoglaz, das ist Kinoprawda. Nicht die unverhoffte Aufnahme um der unverhofften Aufnahme willen, sondern um die Menschen zu zeigen ohne Maske, ohne Schminke, sie mit den Augen des Apparates zu packen im Moment des Nichtspielens. Ihre vom Kinoglas bloßgestellten Gedanken zu lesen.“'
];

// This also needs to get into a json!
const geschmacksliste = [
    'Wut der Faulheit',
    'Wut der Trockenheit',
    'Wut der Fledermaus',
    'Wut des Klebers',
    'Wut der Unwissenheit',
    'Wut des Johans',
    'Wut der Einsamkeit',
    'Wut des Knoblauchs',
    'Wut der Unverständlichkeit',
    'Wut des hAgUsT',
    'Wut des Spechts'
    //'Wut ta fuk is going on here'
];

module.exports = {
	name: 'luhans',
	description: 'Fun with luhans; some recollections to the media-t exam',
    hidden: true,
	execute(msg) {

        // This will store the text which the bot will send
        let returnText;

        // Having some random fun sentences
        const funStuff = [
            `Ich bin ${names[getRandomInt(0, names.length)]}, ich sehe ohne gesehen zu werden.`,
            `Ich bin ${names[getRandomInt(0, names.length)]}, ich laufe rund und mich gibt's in vielen, verschiedenen Geschmäckern - ich bin ein Mediendispositiv in der ${geschmacksliste[getRandomInt(0, geschmacksliste.length)]}!`,
            `Ich bin ${names[getRandomInt(0, names.length)]}, ich sehe ohne gesehen zu werden.`,
            `Heute bist du ein ${names[getRandomInt(0, names.length)]}. Sei glücklich und feiere wie ein ${names[getRandomInt(0, names.length)]}!`,
            `Ich bin ${names[getRandomInt(0, names.length)]}, ich sehe ohne gesehen zu werden.`,
            `Dein Mediendispositiv komme, ${names[getRandomInt(0, names.length)]}s Wille geschehe, wie im HS4 so im heiligen Angry.`,
            `Spüre die ${geschmacksliste[getRandomInt(0, geschmacksliste.length)]}!`,
            `Wut gibt es in vielen, verschiedenen Geschmacksrichtungen. Kennst du schon die ${geschmacksliste[getRandomInt(0, geschmacksliste.length)]}`,
            'Wut ist entfaltet die größte Geschmacksexplosion, wenn du sie genießt - lasse sie zu! Wut schmeckt ohne geschmeckt zu werden.'
        ];

        switch (getRandomInt(0, 3)){

            // Case to get fun stuff
            case 0: 
                 // Calculate the time since the medien-t test.
                 let msSinceKlausur = Date.now() - medienKlausur.getTime();
                 const dSinceKlausur = Math.floor(msSinceKlausur/1000/60/60/24);
                 msSinceKlausur -= dSinceKlausur*1000*60*60*24;
                 
                 const hSinceKlausur = Math.floor(msSinceKlausur/1000/60/60);
                 msSinceKlausur -= hSinceKlausur*1000*60*60;
                 
                 const mSinceKlausur = Math.floor(msSinceKlausur/1000/60);
                 msSinceKlausur -= mSinceKlausur*1000*60;
                 
                 const sSinceKlausur = Math.floor(msSinceKlausur/1000);
 
                 // Setting the variables for the dynamic time description (difference between singular and plural)
                 let hourText, minuteText, secondText; 
 
                 // No need to calculate dayText since it has been days when this code was created!
                 sSinceKlausur > 1 ? secondText = "Sekunden" : secondText = "Sekunde";
                 mSinceKlausur > 1 ? minuteText = "Minuten" : minuteText = "Minute";
                 hSinceKlausur > 1 ? hourText = "Stunden" : hourText = "Stunde";
 
                 returnText = `Sei glücklich, es sind bereits ${dSinceKlausur} Tage ${hSinceKlausur} ${hourText} ${mSinceKlausur} ${minuteText} und ${sSinceKlausur} ${secondText} sind seit der Medientheorie Klausur mit ${names[getRandomInt(0, names.length)]} vergangen!\nEine rachsüchtige Erinnerung - ich hoffe, sie macht dich wütend.`;
            break;

            // Case to get some proper medienDispositive!
            case 1: returnText = "Hallo, ich bin " + names[getRandomInt(0, names.length)] + " und das ist meine momentane, unverständliche Weisheit:\n" + medienDispositive[getRandomInt(0, medienDispositive.length)];
            break;
            
            // Good to know when this exam ended
            case 2: returnText = funStuff[getRandomInt(0, funStuff.length)];
            break;
        }

        // Incremnt the luhans stat
        StatHandler.incrementStat(StatHandler.MCLUHAN);

        msg.channel.send(returnText);
	},
};