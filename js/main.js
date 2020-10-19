require('dotenv').config();
const { app, BrowserWindow, BrowserView, Menu } = require('electron');
const Discord = require('discord.js');
const DiscordOauth2 = require('discord-oauth2');
const getUrlParameter = require('./utils');

const client = new Discord.Client();
const oauth = new DiscordOauth2();

const WINDOW_HEIGHT = 900;
const WINDOW_WIDTH = 1200;

let browserViews = null;

let accessToken = '';

// May be able to ref a repo to get rid of the server list: https://github.com/patrickxchong/hide-discord-sidebar

const baseUrl = 'https://discord.com';
const redirectUrl = `${baseUrl}/channels/@me`;
const discordLoginUrl = `${baseUrl}/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=code&scope=identify%20guilds`;

const init = () => {
    let firstView = new BrowserView();
    let secondView = new BrowserView();
    let thirdView = new BrowserView();

    browserViews = [firstView, secondView, thirdView];
    createWindow();
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        webPreferences: {
            nodeIntegration: true
        }
    });

    for (let i = 0; i < browserViews.length; i++) {
        // Calculate what the y value of the current view should be
        let y = (WINDOW_HEIGHT / browserViews.length) * (i);

        win.addBrowserView(browserViews[i]);

        // Attaching three event listeners to the current view
        ['will-resize', 'maximize', 'unmaximize'].forEach(e => win.addListener(e, () => browserViews[i].setBounds({ x: 0, y: y, width: win.getContentBounds().width, height: win.getContentBounds().height })));
        
        // Set the dimensions and location of the current view. The y is calculated basically where the last view stopped and the height is caclulated to give each view an equal amount of room
        browserViews[i].setBounds({ x: 0, y: y, width: WINDOW_WIDTH, height: WINDOW_HEIGHT / browserViews.length });
        browserViews[i].webContents.loadURL(discordLoginUrl);

        // Once the view navigates to a URL that contains our redirect URL, forcibly navigate the page to be on the first server in the list returned by the API
        browserViews[i].addListener('did-navigate', async () => {
            if (browserViews[i].webContents.getURL().includes(`${redirectUrl}?`)) {
                await getToken(getUrlParameter(browserViews[i].webContents.getURL(), 'code'));
                browserViews[i].webContents.loadURL(getChannelUrl((await oauth.getUserGuilds(accessToken))[0].id)); // TODO: Probably store the guilds in a variable
            }
        })
    };

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

app.whenReady().then(init);
