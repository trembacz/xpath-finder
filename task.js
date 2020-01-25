var omniScrapperTask = omniScrapperTask || (() => {
  class Task {
    constructor() {
      this.site = window.location.hostname;
      this.schemas = [];

      chrome.runtime.sendMessage(
        {contentScriptQuery: "querySchemas"},
        schemas => { this.schemas = schemas }
      );
    }
  }

  this.task = new Task();
  console.log(this.task)

  chrome.runtime.onMessage.addListener(request => {
    if (request.action === 'toggle-omniscrapper-task') {
      console.log("Toggling task");
    }
  });

  return true;
})();
