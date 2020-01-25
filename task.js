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

  class TaskModal {
    constructor(task) {
      this.taskModalId = 'omniscrapper-task';
      this.modalStyles = `*{cursor:crosshair!important;}#omniscrapper-task{bottom:100px; cursor:initial!important;padding:10px;background:gray;color:white;position:fixed;font-size:14px;z-index:10000001;}`;
    }

    toggle() {
      var modal = $("#" + this.taskModalId);

      if (modal.length > 0) {
        modal.toggle();
      } else {
        const styles = document.createElement('style');
        styles.innerText = this.modalStyles;
        document.getElementsByTagName('head')[0].appendChild(styles);

        const contentHtml = document.createElement('div');
        contentHtml.innerText = "LOLKEK2" + " MODAL";
        contentHtml.id = this.taskModalId;
        document.body.appendChild(contentHtml);
      }
    }
  }

  this.task = new Task();
  this.taskModal = new TaskModal(this.task);

  chrome.runtime.onMessage.addListener(request => {
    if (request.action === 'toggle-omniscrapper-task') {
      this.taskModal.toggle();
    }
  });

  return true;
})();
