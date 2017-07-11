const {app, BrowserWindow} = require('electron');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      height: 1920,
      width: 1080
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
});
