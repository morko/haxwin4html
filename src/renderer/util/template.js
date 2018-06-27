const fs = require('fs')
const path = require('path')

module.exports = createTemplate
/**
 * Creates new Template object.
 *
 * @param {function} readFile
 */
function createTemplate() {

  /**
   * Creates a DOM element from a string.
   *
   * @param {string} html
   * @return {Element} returns string if document was not given
   */
  function htmlToElement(html) {
      var template = document.createElement('template')
      // never return a text node of whitespace as the result
      html = html.trim()
      template.innerHTML = html
      return template.content.firstChild
  }

  /**
   * Creates a DOM element from HTML file.
   *
   * @param {string} filePath relative to root directory or an absolute path
   */
  function html(filePath) {
    let file = fs.readFileSync(filePath, 'utf8')
    return htmlToElement(file)
  }

  /**
   * Inserts CSS file to document head.
   *
   * @param {string} filePath relative to root directory or an absolute path
   * @param {Document} document
   * @return {void|string} returns string if document was not given
   */
  function css(filePath, document) {
    let file = fs.readFileSync(filePath, 'utf8')
    if (!document) return file

    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = file;
    } else {
      style.appendChild(document.createTextNode(file))
    }

    head.appendChild(style)
  }

  return {
    html: html,
    css: css
  }
}
