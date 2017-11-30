var injected = injected || (function() {

  var Inspector = function() {
    this.getData = this.getData.bind(this);
    this.$target = document.body;
    this.cssId = 'xpathPlugin';
    this.pluginId = 'xpath-plugin';
    this.css = "* { cursor: crosshair !important; } #xpath-plugin { cursor: initial !important } #xpath-plugin { width: 100%; padding: 10px; background: gray; color: white; position: fixed; bottom: 0; font-size: 14px; z-index: 10000000; }";
  }

  Inspector.prototype = {
    getData: function(e) {
      e.preventDefault();
      this.$target = e.target;
      if (e.target.id !== this.pluginId) {
        const XPath = this.getXPath(e.target);
        var pluginHTML = document.getElementById(this.pluginId);
        // fix updating text only - not removing and adding again
        if (pluginHTML) { pluginHTML.remove(); }
        this.createHTML(XPath);
      }
    },

    createHTML: function(XPath) {
      let outerHTML = `<div id="${this.pluginId}">XPath: ${XPath}</div>`;
      outerHTML = new DOMParser().parseFromString(outerHTML, "text/html");
      document.body.appendChild(outerHTML.getElementById(this.pluginId));
    },

    activate: function() {
      document.addEventListener('click', this.getData);
    },

    deactivate: function() {
      // remove bottom
      var pluginHTML = document.getElementById(this.pluginId);
      if (pluginHTML) { pluginHTML.remove(); }
      document.removeEventListener('click', this.getData);
    },

    setStyles: function() {
      var styles = document.createElement("style");
      styles.innerText = this.css;
      styles.id = this.cssId;
      document.getElementsByTagName("head")[0].appendChild(styles);
    },

    removeStyles: function() {
      var cssNode = document.getElementById(this.cssId);
      cssNode && cssNode.parentNode.removeChild(cssNode);
    },

    getXPath: function(el) {
      if (el.id) {
        return `//*[@id="${el.id}"]`;
      }
      const parts = [];
      while (el && el.nodeType === Node.ELEMENT_NODE) {
        let nbOfPreviousSiblings = 0;
        let hasNextSiblings = false;
        let sibling = el.previousSibling;
        while (sibling) {
          if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE &&
              sibling.nodeName == el.nodeName) {
            nbOfPreviousSiblings++;
          }
          sibling = sibling.previousSibling;
        }
        sibling = el.nextSibling;
        while (sibling) {
          if (sibling.nodeName == el.nodeName) {
            hasNextSiblings = true;
            break;
          }
          sibling = sibling.nextSibling;
        }
        const prefix = el.prefix ? el.prefix + ":" : "";
        const nth = nbOfPreviousSiblings || hasNextSiblings
                    ? `[${nbOfPreviousSiblings + 1}]` : "";
        parts.push(prefix + el.localName + nth);
        el = el.parentNode;
      }
      return parts.length ? "/" + parts.reverse().join("/") : "";
    }
  };

  var inspect = new Inspector();

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'activate') {
      inspect.setStyles();
      return inspect.activate();
    } else {
      inspect.removeStyles();
      return inspect.deactivate();
    }
  });
  return true;
})();