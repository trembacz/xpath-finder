let tabs = {};
const inspectFile = 'inspect.js';
const activeIcon = 'active-64.png';
const defaultIcon = 'default-64.png';

const inspect = {
  toggleActivate: function(id, type, icon) {
    this.id = id;
    chrome.tabs.executeScript(id, {
      file: inspectFile
    }, function() {  chrome.tabs.sendMessage(id, { action: type }); }.bind(this));

    chrome.browserAction.setIcon({ tabId: id, path: { 19: "icons/" + icon } });
  }
};

function toggle(tab) {
  if (isSupportedProtocol(tab.url)) {
    if (!tabs[tab.id]) {
      tabs[tab.id] = Object.create(inspect);
      inspect.toggleActivate(tab.id, 'activate', activeIcon);
    } else {
      inspect.toggleActivate(tab.id, 'deactivate', defaultIcon);
      for (let tabId in tabs) {
        if (tabId == tab.id) delete tabs[tabId];
      }
    }
  }
}

function deactivateItem(tab) {
  if (tab[0]) {
    if (isSupportedProtocol(tab[0].url)) {
      for (let tabId in tabs) {
        if (tabId == tab[0].id) {
          delete tabs[tabId];
          inspect.toggleActivate(tab[0].id, 'deactivate', defaultIcon);
        }
      }
    }
  }
}

function getActiveTab() {
  var gettingActiveTab = chrome.tabs.query({active: true, currentWindow: true});
  // check chrome, on firefox works without if
  if (gettingActiveTab) {
    gettingActiveTab.then(deactivateItem);
  }
  
}

function isSupportedProtocol(urlString) {
  const supportedProtocols = ["https:", "http:", "file:"];
  const url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
}

chrome.tabs.onUpdated.addListener(getActiveTab);
chrome.browserAction.onClicked.addListener(toggle);
// browser.tabs.onActivated.addListener(getActiveTab);