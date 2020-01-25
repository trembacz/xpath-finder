var omniScrapperTask = omniScrapperTask || (() => {
  chrome.runtime.onMessage.addListener(request => {
    if (request.action === 'toggle-omniscrapper-task') {
      console.log("Toggling task");
    }
  });

  return true;
})();
