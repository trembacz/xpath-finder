function saveOptions(e) {
  chrome.storage.local.set({
    inspector: document.querySelector("#inspector").checked,
    clipboard: document.querySelector("#copy").checked,
    position: document.querySelector("#position").value
  }, function() {
    const status = document.querySelector('.status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
  e.preventDefault();
}

function restoreOptions() {
  chrome.storage.local.get({
    inspector: true,
    clipboard: true,
    position: 'bl'
  }, function(items) {
    document.querySelector("#inspector").checked = items.inspector;
    document.querySelector("#copy").checked = items.clipboard;
    document.querySelector("#position").value = items.position;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
