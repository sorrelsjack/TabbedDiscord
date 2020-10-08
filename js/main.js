require('dotenv').config();
const { app, BrowserWindow, BrowserView } = require('electron');
const Discord = require('discord.js');
const DiscordOauth2 = require('discord-oauth2');
const getUrlParameter = require('./utils');

const client = new Discord.Client();
const oauth = new DiscordOauth2();

let accessToken = '';

// May be able to ref a repo to get rid of the server list: https://github.com/patrickxchong/hide-discord-sidebar

const baseUrl = 'https://discord.com';
const redirectUrl = `${baseUrl}/channels/@me`;
const discordLoginUrl = `${baseUrl}/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=code&scope=identify%20guilds`;

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

    view.webContents.addListener('did-navigate', async () => { 
        if (view.webContents.getURL().includes(`${redirectUrl}?`)) {
            await getToken(getUrlParameter(view.webContents.getURL(), 'code'));
            view.webContents.loadURL(getChannelUrl((await oauth.getUserGuilds(accessToken))[0].id)); // TODO: Probably store the guilds in a variable
        }
    })

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

        accessToken = res.access_token;
        const guilds = await oauth.getUserGuilds(accessToken);
        console.log(guilds)
    }
    catch (e) {
        console.log(e);
    }
}

const getChannelUrl = (id) => `${baseUrl}/channels/${id}`;

app.whenReady().then(createWindow);