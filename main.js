const electron = require('electron');

const { app, BrowserWindow, TouchBar, session, ipcMain } = require('electron');
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar;
const path = require('path');
const url = require('url');
const fetch =require('electron-fetch');

const bitcoinprice = new TouchBarButton({
    label: 'Bitcoin Price: ',
    textColor: '#ABCDEF',
    icon: path.join(__dirname, '/img/bitcoin.png'),
    iconPosition: 'left',
});
const ethereumprice = new TouchBarButton({
    label: 'Bitcoin Price: ',
    textColor: '#ABCDEF',
    icon: path.join(__dirname, '/img/ethereum.png'),
    iconPosition: 'left',
});
const rippleprice = new TouchBarButton({
    label: 'Ripple Price: ',
    textColor: '#ABCDEF',
    icon: path.join(__dirname, '/img/ripple.png'),
    iconPosition: 'left',
});

const updateReels = (input) => {
    //This iterates through the API response and finds the correct price using the id.
    for(let i=0; i<input.length; i++){
        if(input[i].id == 'bitcoin'){
            bitcoinprice.label = 'Bitcoin $' + input[i].price_usd;
        } 
        if(input[i].id == 'ethereum'){  
            ethereumprice.label = 'Ethereum  $' + input[i].price_usd;
        }
        if(input[i].id == 'ripple'){  
            rippleprice.label = 'Ripple $' + input[i].price_usd;
        }
    }
};

//Uses the electron-fetch to fetch api.
const bitcoin = fetch('https://api.coinmarketcap.com/v1/ticker/?limit=20')
    .then(
        (res) => 
        res.json()
    ).then(
        (json) => {
            updateReels(json)
        }
    )

//This repeats the api call every 2.5 minutes 
setInterval(function() {
    fetch('https://api.coinmarketcap.com/v1/ticker/?limit=20')
    .then(
        (res) => 
        res.json()
    ).then(
        (json) => {
            updateReels(json)
        }
    )
}, 150000);


const touchBar = new TouchBar([
    new TouchBarSpacer({size: 'small'}),
    bitcoinprice,
    new TouchBarSpacer({size: 'large'}),
    ethereumprice,
    new TouchBarSpacer({size: 'large'}),
    rippleprice,
]);



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

    win.setTouchBar(touchBar);
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
