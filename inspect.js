var injected = injected || (function() {
  
    const Inspector = function() {
      this.getData = this.getData.bind(this);
      this.draw = this.draw.bind(this);
      this.contentNode = 'xpath-content';
      this.wrapNode = 'xpath-wrap';
      this.canvasNode = 'xpath-canvas';
      this.cssNode = 'xpath-css';
      this.styles = "\
        * {cursor:crosshair!important;}\
        #xpath-wrap {pointer-events:none;top:0;position:absolute;z-index:10000000;}\
        #xpath-content {cursor:initial!important;padding:10px;background:gray;color:white;position:fixed;bottom:0;font-size:14px;z-index:10000000;}\
        #xpath-canvas {position:relative;}";
    }
  
    Inspector.prototype = {
      getData: function(e) {
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        if (e.target.id !== this.contentNode) {
          const XPath = this.getXPath(e.target);
          const contentNode = document.getElementById(this.contentNode);
          if (contentNode) {
            contentNode.innerText = XPath;
          } else {
            const contentHtml = document.createElement("div");
            contentHtml.innerText = XPath;
            contentHtml.id = this.contentNode;
            document.body.appendChild(contentHtml);
          }
        }
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
        document.addEventListener('mouseover', this.draw);
      },
  
      removeListeners: function() {
        document.removeEventListener('click', this.getData);
        document.removeEventListener('mouseover', this.draw);
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
        return inspect.activate();
      } else {
        return inspect.deactivate();
      }
    });
    return true;
  })();