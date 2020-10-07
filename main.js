require('dotenv').config();

const electron = require('electron');
const { app, BrowserWindow, BrowserView } = require('electron');

const Discord = require('discord.js');
const client = new Discord.Client();

const baseDiscordUrl = 'https://discord.com/';

const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });

    const view = new BrowserView();
    win.setBrowserView(view);
    view.setBounds({ x: 0, y: 0, width: 800, height: 600});
    view.webContents.loadURL(baseDiscordUrl);
  
    //console.log(client.channels.cache.map(c => c.key))
    win.loadFile('index.html');
  }
  
  app.whenReady().then(createWindow);