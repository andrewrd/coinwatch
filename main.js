const electron = require('electron');

const { app, BrowserWindow, TouchBar, session, ipcMain } = require('electron');
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar;
const fs = require('fs');
const path = require('path');
const url = require('url');
const fetch = require('electron-fetch');

const defaultConfig = {
    refresh: 10000, // 10 seconds
    coins: [
        "bitcoin",
        "ethereum",
        "ripple"
    ]
};

function button(coinName, price) {
    return new TouchBarButton({
        label: coinName + ' $' + price,
        textColor: '#ABCDEF',
        icon: path.join(__dirname, '/img/' + coinName + '.png'),
        iconPosition: 'left',
    });
}

function touchBar(response) {
    var buttons = response.map((coin) => {
        if (coin.id == 'bitcoin') {
            console.log(coin.price_usd);
            return button('bitcoin', coin.price_usd);
        }

        if (coin.id == 'ethereum') {
            return button('ethereum', coin.price_usd);
        }

        if (coin.id == 'ripple') {
            return button('ripple', coin.price_usd);
        }
    });

    return new TouchBar(
        buttons.filter((b) => b !== undefined));
}

function createWindow() {
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
        ).then((json) => { win.setTouchBar(touchBar(json)); })
    };

    refresh();
    setInterval(refresh, defaultConfig.refresh);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
    //    app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
