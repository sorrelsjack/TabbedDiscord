require('dotenv').config();

const electron = require('electron');
const { app, BrowserWindow, BrowserView } = require('electron');

const Discord = require('discord.js');
const client = new Discord.Client();

const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();

const redirectUrl = 'https://discord.com/channels/@me';
const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=code&scope=identify%20guilds`;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true
        }
    });

    const view = new BrowserView();
    win.setBrowserView(view);
    view.setBounds({ x: 0, y: 0, width: 1200, height: 900 });
    view.webContents.loadURL(discordLoginUrl);
    view.webContents.addListener('did-navigate', () => {
        if (view.webContents.getURL().includes(`${redirectUrl}?`)) {
            console.log('Navigation successful');
            //getToken();
        }
    })

    //console.log(client.channels.cache.map(c => c.key))
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

const getToken = async () => {
    let token = '';

    try {
        token = await oauth.tokenRequest({
            clientId: proccess.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            code: "query code",
            scope: "identify guilds",
            grantType: "authorization_code",
            redirectUri: redirectUrl
        });
    }
    catch (e) {
        console.log(e);
    }

    console.log(token)
}