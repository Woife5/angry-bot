const readline = require("readline");
const { google } = require("googleapis");
const {
    promises: { readFile, writeFile },
} = require("fs");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Google API Token file
 */
const TOKEN_PATH = "./stats-and-cache/google-token.json";

/**
 * Google API credentials
 */
const credentials = require("../config/credentials.json");

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    readFile(TOKEN_PATH)
        .then(buffer => {
            const googleToken = JSON.parse(buffer.toString());
            oAuth2Client.setCredentials(googleToken);
            callback(oAuth2Client);
        })
        .catch(err => {
            console.error(err);
        });
}

/**
 * Array that stores the data to be inserted into the google sheet
 */
let values;
let tarotValues;
let userValues;

/**
 * Writes data to Angry Stat Google Sheet
 */
function writeData(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    const resource = {
        values,
    };
    sheets.spreadsheets.values.append(
        {
            spreadsheetId: "1RTlHaLkJVtK15XNrAV-B3eyfRNPV-Vs_RVpvVLm8uLc",
            range: "raw-data!A1",
            valueInputOption: "RAW",
            resource: resource,
        },
        (err, result) => {
            if (err) {
                // Handle error
                console.log(err);
            } else {
                console.log("Stat-backup complete, updated cells: %s", result.data.updates.updatedRange);
            }
        }
    );
}

/**
 * Writes tarot data to Angry Stat Google Sheet
 */
function writeTarotData(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    const resource = {
        values: tarotValues,
    };
    sheets.spreadsheets.values.append(
        {
            spreadsheetId: "1RTlHaLkJVtK15XNrAV-B3eyfRNPV-Vs_RVpvVLm8uLc",
            range: "raw-tarot-data!A1",
            valueInputOption: "RAW",
            resource: resource,
        },
        (err, result) => {
            if (err) {
                // Handle error
                console.log(err);
            } else {
                console.log("Stat-backup complete, updated cells: %s", result.data.updates.updatedRange);
            }
        }
    );
}

function writeUserData(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    const resource = {
        values: userValues,
    };
    sheets.spreadsheets.values.append(
        {
            spreadsheetId: "1RTlHaLkJVtK15XNrAV-B3eyfRNPV-Vs_RVpvVLm8uLc",
            range: "raw-user-data!A1",
            valueInputOption: "RAW",
            resource: resource,
        },
        (err, result) => {
            if (err) {
                // Handle error
                console.log(err);
            } else {
                console.log("Stat-backup complete, updated cells: %s", result.data.updates.updatedRange);
            }
        }
    );
}

module.exports = {
    /**
     * Handles inserting data into The Angry-Bot-Stats Google Sheet
     * @param {Array<String>} data Array of Strings to insert into the Google Sheet
     */
    saveToSheet(data) {
        values = [];
        values.push(data);
        authorize(credentials, writeData);
    },

    /**
     * Handles inserting data into The Angry-Bot-Stats Google Sheet
     * @param {Array<String>} data Array of Strings to insert into the Google Sheet
     */
    saveTarotDataToSheet(data) {
        tarotValues = [];
        tarotValues.push(data);
        authorize(credentials, writeTarotData);
    },

    /**
     * Saves user-specific data to google sheet
     * @param {Array<Array<String>>} data Userdata, one user per line
     */
    saveUserDataToSheet(data) {
        userValues = data;
        authorize(credentials, writeUserData);
    },

    /**
     * The url that a new access token can be generated from
     * @returns Google API auth url
     */
    async getTokenUrl() {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        return oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
        });
    },

    /**
     * Generates a new 7-day access token to googles APIs
     * @param {String} code new access code for google APIs
     */
    async setNewToken(code) {
        try {
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            const token = await oAuth2Client.getToken(code);

            // Store token to disk
            await writeFile(TOKEN_PATH, JSON.stringify(token.tokens));

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
};
