
const { Client, Authenticator } = require("minecraft-launcher-core")
const { app, BrowserWindow, ipcMain } = require("electron")
const launcher = new Client();
const path = require('path')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,
        title: "Launcher MC",
        //icon: "asset/icon.png",
        width: 1000,
        height: 650,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadURL(path.join(__dirname, 'index.html'))
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("login", (event, data) => {
    Authenticator.getAuth(data.pseudo, data.passwd).then(() => {
        event.sender.send("co")
        let opts = {
            clientPackage: null,
            authorization: Authenticator.getAuth(data.pseudo, data.passwd),
            root: path.join(app.getPath("appData"), "C:/Users/kilyann/Desktop/InterCraft.2/ModPack/minecraft.jar"),
            version: {
                number: "1.12.2",
                type: "release"
             
            },
            
            memory: {
                max: "6000",
                min: "4000"
            }
            
        }

        launcher.launch(opts);

        launcher.on('debug', (e) => console.log(e));
        launcher.on('data', (e) => { console.log(e); mainWindow.hide() });
        launcher.on('close', (e) => app.quit());
        launcher.on('progress', (e) => {
            event.sender.send("progression", e)
        })
    }).catch(() => {
        event.sender.send("err")
    })
})