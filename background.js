const browserAppData = this.browser || this.chrome;
const tabs = {};
const inspectFile = "inspect.js";
const activeIcon = "active-64.png";
const defaultIcon = "default-64.png";

const inspect = {
  toggleActivate: (id, type, icon) => {
    this.id = id;
    browserAppData.scripting.executeScript(
      {
        target: { tabId: id },
        files: [inspectFile]
      },
      () => {
        browserAppData.tabs.sendMessage(id, { action: type });
      }
    );

    browserAppData.action.setIcon({ tabId: id, path: { 19: "icons/" + icon } });
  }
};

function isSupportedProtocolAndFileType(urlString) {
  if (!urlString) {
    return false;
  }
  const url = new URL(urlString);
  const supportedProtocols = ["https:", "http:", "file:"];
  const notSupportedFiles = ["xml", "pdf", "rss"];
  const extension = url.href.split(".").pop().split(/\#|\?/)[0];

  return supportedProtocols.indexOf(url.protocol) !== -1 && notSupportedFiles.indexOf(extension) === -1;
}

function toggle(tab) {
  if (isSupportedProtocolAndFileType(tab.url)) {
    if (!tabs[tab.id]) {
      tabs[tab.id] = Object.create(inspect);
      inspect.toggleActivate(tab.id, "activate", activeIcon);
    } else {
      inspect.toggleActivate(tab.id, "deactivate", defaultIcon);
      for (const tabId in tabs) {
        if (tabId == tab.id) delete tabs[tabId];
      }
    }
  }
}

function deactivateItem(tab) {
  if (tab[0]) {
    if (isSupportedProtocolAndFileType(tab[0].url)) {
      for (const tabId in tabs) {
        if (tabId == tab[0].id) {
          delete tabs[tabId];
          inspect.toggleActivate(tab[0].id, "deactivate", defaultIcon);
        }
      }
    }
  }
}

function getActiveTab() {
  browserAppData.tabs.query({ active: true, currentWindow: true }, tab => {
    deactivateItem(tab);
  });
}

browserAppData.commands.onCommand.addListener(command => {
  if (command === "toggle-xpath") {
    browserAppData.tabs.query({ active: true, currentWindow: true }, tab => {
      toggle(tab[0]);
    });
  }
});

browserAppData.tabs.onUpdated.addListener(getActiveTab);
browserAppData.action.onClicked.addListener(toggle);
