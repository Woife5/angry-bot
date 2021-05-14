const readline = require('readline');
const { google } = require('googleapis');
const {promises: {readFile, writeFile}} = require("fs");

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Google API Token file
 */
const TOKEN_PATH = './stats-and-cache/google-token.json';

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
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    readFile(TOKEN_PATH).then(buffer => {
        oAuth2Client.setCredentials(JSON.parse(buffer.toString()));
    }).catch(err => {
        getNewToken(oAuth2Client, callback);
    }).finally(() => {
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            writeFile(TOKEN_PATH, JSON.stringify(token)).catch(err => {
                console.error(err);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Array that stores the data to be inserted into the google sheet
 */
let values;
let tarotValues;

/**
 * Writes data to Angry Stat Google Sheet
 */
function writeData(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const resource = {
        values,
    };
    sheets.spreadsheets.values.append({
        spreadsheetId: '1RTlHaLkJVtK15XNrAV-B3eyfRNPV-Vs_RVpvVLm8uLc',
        range: 'raw-data!A1',
        valueInputOption: 'RAW',
        resource: resource,
    }, (err, result) => {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            console.log("Stat-backup complete, updated cells: %s", result.data.updates.updatedRange)
        }
    });
}

/**
 * Writes tarot data to Angry Stat Google Sheet
 */
function writeTarotData(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const resource = {
        "values": tarotValues,
    };
    sheets.spreadsheets.values.append({
        spreadsheetId: '1RTlHaLkJVtK15XNrAV-B3eyfRNPV-Vs_RVpvVLm8uLc',
        range: 'raw-tarot-data!A1',
        valueInputOption: 'RAW',
        resource: resource,
    }, (err, result) => {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            console.log("Stat-backup complete, updated cells: %s", result.data.updates.updatedRange)
        }
    });
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
    }
};