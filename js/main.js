require('dotenv').config();
const { app, BrowserWindow, BrowserView } = require('electron');
const Discord = require('discord.js');
const DiscordOauth2 = require('discord-oauth2');
const getUrlParameter = require('./utils');

const client = new Discord.Client();
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
    view.webContents.addListener('did-navigate', () => { if (view.webContents.getURL().includes(`${redirectUrl}?`)) getToken(getUrlParameter(view.webContents.getURL(), 'code')); })

    win.loadFile('index.html');
}

const getToken = async (code) => {
    let res = '';

    try {
        res = await oauth.tokenRequest({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            code: code,
            scope: 'identify guilds',
            grantType: 'authorization_code',
            redirectUri: redirectUrl
        });

        const guilds = await oauth.getUserGuilds(res.access_token);
        console.log(guilds)
    }
    catch (e) {
        console.log(e);
    }
}

app.whenReady().then(createWindow);