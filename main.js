const electron = require('electron');

const { app, BrowserWindow, TouchBar, session, ipcMain } = require('electron');
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar;
const expandTilde = require('expand-tilde');
const fs = require('fs');
const path = require('path');
const url = require('url');
const fetch = require('electron-fetch');

const defaultConfig = {
    refresh: 150000, // 2.5 minutes
    coins: [
        "bitcoin",
        "ethereum",
        "ripple"
    ]
};

function button(coinName, price) {
    var iconPath = path.join(__dirname, '/img/' + coinName + '.png');
    if (!fs.existsSync(iconPath)) {
        iconPath = path.join(__dirname, '/img/notfound.png');
    }

    return new TouchBarButton({
        //label: coinName + ' $' + price,
        textColor: '#ABCDEF',
        icon: iconPath,
        iconPosition: 'left',
        click: () => {
          let win = new BrowserWindow({width: 900, height: 800})
          win.on('closed', () => {
            win = null
          })

          // Load a remote URL
          win.loadURL('https://coinmarketcap.com/currencies/' + coinName)
        }
    });
}

function touchBar(response, ids) {
    var buttons =
        response.filter(
            (coin) => ids.includes(coin.id)
        ).map(
            (coin) => button(coin.id, coin.price_usd));

    return new TouchBar(
        buttons.filter((b) => b !== null));
}

function createWindow(config) {
    // Create the browser window.
    win = new BrowserWindow({ width: 500, height: 260, icon: path.join(__dirname, '/img/logo.png') });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    //win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    var refresh = () => {
        fetch('https://api.coinmarketcap.com/v1/ticker/?limit=20')
        .then((res) => { return res.json(); }
        ).then((json) => { win.setTouchBar(touchBar(json, config.coins)); })
    };

    refresh();
    setInterval(refresh, config.refresh);
}

// Load user-defined configuration (use default otherwise)
app.on('ready', () => {
    var configPath = expandTilde('~/.coinwatch.json');
    if (fs.existsSync(configPath)) {
        createWindow(JSON.parse(fs.readFileSync(configPath)));
    } else {
        createWindow(defaultConfig);
    }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
    //    app.quit();
    }
});
