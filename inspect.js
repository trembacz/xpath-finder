var injected = injected || (function() {
  
    const Inspector = function() {
      this.getData = this.getData.bind(this);
      this.draw = this.draw.bind(this);
      this.setOptions = this.setOptions.bind(this);
      this.contentNode = 'xpath-content';
      this.wrapNode = 'xpath-wrap';
      this.canvasNode = 'xpath-canvas';
      this.cssNode = 'xpath-css';
    }
  
    Inspector.prototype = {
      getData: function(e) {
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        if (e.target.id !== this.contentNode) {
          const XPath = this.getXPath(e.target);
          this.XPath = XPath;
          const contentNode = document.getElementById(this.contentNode);
          if (contentNode) {
            contentNode.innerText = XPath;
          } else {
            const contentHtml = document.createElement("div");
            contentHtml.innerText = XPath;
            contentHtml.id = this.contentNode;
            document.body.appendChild(contentHtml);
          }

          this.options.clipboard && ( this.copyText(XPath) );
        }
      },

      copyText: function(XPath) {
        var hdInp = document.createElement("input");
        hdInp.setAttribute("value", XPath);
        document.body.appendChild(hdInp);
        hdInp.select();      
        document.execCommand("copy");
        document.body.removeChild(hdInp);
      },
      
      draw: function(e) {
        const canvas = document.getElementById(this.canvasNode);
        const context = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth - 20;
        this.height = canvas.height = window.innerHeight;

        const iStyle = e.target.getBoundingClientRect();
        const cStyle = window.getComputedStyle(e.target);       
  
        const item = {
          width: iStyle.width,
          height: iStyle.height,
          top: iStyle.top,
          left: iStyle.left,
          pdTop: parseInt(cStyle.paddingTop, 10),
          pdRight: parseInt(cStyle.paddingRight, 10),
          pdBottom: parseInt(cStyle.paddingBottom, 10),
          pdLeft: parseInt(cStyle.paddingLeft, 10)
        };
  
        const width = item.width - item.pdRight - item.pdLeft;
        const height = item.height - item.pdBottom - item.pdTop;
  
        context.fillStyle = 'rgba(68,182,226,0.3)';
        context.fillRect(
          item.left + item.pdLeft,
          item.top + item.pdTop,
          width,
          height
        );
  
        canvas.style.top = `${Math.abs(document.body.getBoundingClientRect().top)}px`;
      },
  
      activate: function() {
        this.addStyles();
        this.addHtml();
        this.addListeners();
      },
  
      deactivate: function() {
        this.removeStyles();
        this.removeHtml();
        this.removeListeners();
      },

      addStyles: function() {
        if (!document.getElementById(this.cssNode)) {
          const styles = document.createElement("style");
          styles.innerText = this.styles;
          styles.id = this.cssNode;
          document.getElementsByTagName("head")[0].appendChild(styles);
        }
      },
  
      removeStyles: function() {
        const cssNode = document.getElementById(this.cssNode);
        cssNode && cssNode.remove();
      },
  
      addHtml: function() {
        if (!document.getElementById(this.wrapNode)) {
          let outerHtml = `<div id="${this.wrapNode}"><canvas id="${this.canvasNode}" /></div>`;
          outerHtml = new DOMParser().parseFromString(outerHtml, "text/html");
          document.body.appendChild(outerHtml.getElementById(this.wrapNode));
        }
      },
  
      removeHtml: function() {
        const wrapNode = document.getElementById(this.wrapNode);
        const contentNode = document.getElementById(this.contentNode);
        wrapNode && wrapNode.remove();
        contentNode && contentNode.remove();
      },
  
      addListeners: function() {
        document.addEventListener('click', this.getData);
        this.options.inspector && ( document.addEventListener('mouseover', this.draw) );
      },
  
      removeListeners: function() {
        document.removeEventListener('click', this.getData);
        this.options.inspector && ( document.removeEventListener('mouseover', this.draw) );
      },

      getOptions: function() {
        const storage = chrome.storage && (chrome.storage.local)
        const promise = storage.get({
          inspector: true,
          clipboard: true,
          position: 'bl'
        }, this.setOptions);
        (promise && promise.then) && (promise.then(this.setOptions()));
      },

      setOptions: function(options) {
        this.options = options;
        let position = "bottom:0;left:0";
        switch (options.position) {
          case 'tl': position = "top:0;left:0"; break;
          case 'tr': position = "top:0;right:0"; break;
          case 'br': position = "bottom:0;right:0"; break;
          default: break;
        }
        this.styles = `\
        * {cursor:crosshair!important;}\
        #xpath-wrap {pointer-events:none;top:0;position:absolute;z-index:10000000;}\
        #xpath-content {${position};cursor:initial!important;padding:10px;background:gray;color:white;position:fixed;font-size:14px;z-index:10000000;}\
        #xpath-canvas {position:relative;}`;

        this.activate();
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
  
    const inspect = new Inspector();
    
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === 'activate') {
        return inspect.getOptions();
      } else {
        return inspect.deactivate();
      }
    });

    return true;
  })();