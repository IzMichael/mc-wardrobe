const {
    app,
    BrowserWindow
} = require("electron");

var mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 506.25,
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
        icon: 'favicon.png'
    });
    mainWindow.loadFile("index.html");
    mainWindow.maximize();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
}

app.on("ready", createWindow);

app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});