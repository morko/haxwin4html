const {ipcRenderer} = require('electron')
const { html, css } = require('./util').template
const path = require('path')

/**
 * "Injects" the DOM manipulating javascript after renderer has loaded the DOM
 */
document.addEventListener("DOMContentLoaded", function(event) {
  injectFunctions()
  removeAdds()
  modifyOriginalHeader()
  insertCSS()
  insertHTML()
  ipcRenderer.send('dom-ready')
})

// hack to be able to close window while in room
ipcRenderer.on('remove-before-unload', onRemoveBeforeUnload)
function onRemoveBeforeUnload() {
  removeOnBeforeUnload()
}
/**
 * Removes onbeforeunload function from the haxball iframe, because it made
 * the browser unable to navigate or close while connected to a room.
 * It should show a dialog to confirm if user wants to leave but it does not.
 */
function removeOnBeforeUnload() {
  let iframe = document.getElementsByClassName("gameframe")[0]
  if (!iframe) return
  let iframeWindow = iframe.contentWindow
  iframeWindow.onbeforeunload = undefined
}

/**
 * Removes the google advertisements containing element from DOM.
 */
function removeAdds() {
  let adds = document.querySelector(".rightbar")
  if (!adds) return;
  adds.parentNode.removeChild(adds)
}

/**
 * Remove some links that can go to potentially harmful places.
 */
function modifyOriginalHeader() {
  let header = document.querySelector(".header")
  let links = header.getElementsByTagName("a")
  for (let link of links) {
    if (link.innerHTML === "Flash" || link.innerHTML === "News")
      header.removeChild(link)
  }
}

function insertHTML() {
  insertNavigation()
}

function insertCSS() {
  css(path.join(__dirname, 'client.css'), document)
}

/**
 * Inserts the navigation textbox and join button into the haxball header.
 */
function insertNavigation() {
  let navigation = html(path.join(__dirname, 'client-navigation.html'))

  let header = document.querySelector(".header")
  let title = header.getElementsByClassName("title")[0]
  header.insertBefore(navigation, title.nextSibling)
  let navigationTextbox = document.querySelector(".navigation-textbox")
  navigationTextbox.value = window.location
}

/**
 * Injects the event handlers for GUI functionalities in to the browsers scope.
 */
function injectFunctions() {
  window.haxwin = {
    onNavigationButtonClicked: onNavigationButtonClicked
  }
}
/**
 * Handles the clicking event of the Join button. Sends the main process
 * a signal to navigate to the provided URL.
 */
function onNavigationButtonClicked() {
  removeOnBeforeUnload()
  let navigationTextbox = document.querySelector(".navigation-textbox")
  let url = navigationTextbox.value
  ipcRenderer.send('navigate', url)
}
