const { BrowserWindow, BrowserView, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

function createBrowserWindow(opt) {
  let preloadScript = './renderer/preload-client.js'

  let browser = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, preloadScript),
      devTools: opt.devTools
    }
  })
  if (opt.devTools) {
    browser.webContents.openDevTools()
  }
  browser.setMenu(null)
  return browser
}

class HaxBrowser {

  constructor(opt) {
    // optional params
    opt = opt || {}
    // enable developer tools or not
    this.devTools = opt.devTools || false
    // the main window with haxball
    this.window = opt.window || createBrowserWindow({
      host: this.host,
      devTools: this.devTools,
    })
    // url for the haxball site
    this.defaultURL = opt.defaultURL || 'https://www.haxball.com/play'
    // urls has to start with either of these strings
    this.allowedURL = opt.allowedURL || [
      'https://www.haxball.com/',
      'http://www.haxball.com/',
      'https://html5.haxball.com/',
      'http://html5.haxball.com/',
    ]
    // splash screen shown when navigating between url
    this.disableSplashScreen = opt.disableSplashScreen || false

    // placeholder for splashscreen BrowserView
    this.splashScreen = null

    // listeners
    this.window.on('close', () => {
      // hack to be able to close window while in room
      this.window.webContents.send('remove-before-unload')
    })
    this.window.on('closed', () => {
      this.window = null
    })
    ipcMain.on('navigate', (event, url) => {
      this.onNavigate(event, url)
    })
    ipcMain.on('dom-ready', (event) => {
      this.onDomReady(event)
    })

  }

  start() {
    this.navigate()
  }

  navigate(url) {
    this.showSplashScreen()
    if (!url) {
      this.window.loadURL(this.defaultURL)
    } else {
      if (!this.filter(url)) {
        this.hideSplashScreen()
        return
      }
      this.window.loadURL(url)
    }
  }

  filter(url) {
    // if allowed URL is a string
    if (typeof this.allowedURL === 'string') {
      if (url.startsWith(allowed))
        return true
      return false
    }

    // if allowed URLs are listed as an Array
    for (let allowed of this.allowedURL) {
      if (url.startsWith(allowed))
        return true
    }
    return false
  }

  showSplashScreen() {
    if (this.disableSplashScreen) return
    this.splashScreen = new BrowserView()
    this.window.setBrowserView(this.splashScreen)

    this.splashScreen.setBounds({
      x: 0,
      y: 0,
      width: this.window.getBounds().width,
      height: this.window.getBounds().height
    })

    this.splashScreen.setAutoResize({width: true, height: true})

    this.splashScreen.webContents.loadURL(url.format({
      pathname: path.join(__dirname, 'splash.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  hideSplashScreen() {
    if (this.disableSplashScreen) return
    this.window.setBrowserView(null)
    if (!this.splashScreen) return
    try {
      this.splashScreen.destroy()
    } finally {
      this.splashScreen = null
    }
  }

  // EVENT HANDLERS
  onNavigate(event, url) {
    this.navigate(url)
  }

  onDomReady(event) {
    this.hideSplashScreen()
  }
}

module.exports = HaxBrowser
