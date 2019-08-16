const browserAppData = this.browser || this.chrome;
const shortcutCommand = 'toggle-xpath';
const updateAvailable = (typeof browserAppData.commands.update !== 'undefined') ? true : false;
const isMac = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;
const shortCutKeys = isMac ? 'Command+Shift+' : 'Ctrl+Shift+';
const shortCutLabels = isMac ? 'CMD+SHIFT+' : 'CTRL+SHIFT+';

async function updateShortcut() {
	updateAvailable && await browserAppData.commands.update({
		name: shortcutCommand,
		shortcut: shortCutKeys + document.querySelector('#shortcut').value
	});
}

async function resetShortcut() {
	if (updateAvailable) {
		await browserAppData.commands.reset(shortcutCommand);
		const commands = await browserAppData.commands.getAll();
		for (const command of commands) {
			if (command.name === shortcutCommand) {
				document.querySelector('#shortcut').value = command.shortcut.substr(-1);
			}
		}
		saveOptions();
	}
}

function shortcutKeyField(event) {
	event.target.value = event.target.value.toUpperCase();
}

function saveOptions(e) {
	browserAppData.storage.local.set({
		inspector: document.querySelector('#inspector').checked,
		clipboard: document.querySelector('#copy').checked,
		shortid: document.querySelector('#shortid').checked,
		position: document.querySelector('#position').value,
		shortcut: document.querySelector('#shortcut').value
	}, () => {
		const status = document.querySelector('.status');
		status.textContent = 'Options saved.';
		updateAvailable && updateShortcut();
		setTimeout(() => {
			status.textContent = '';
		}, 1000);
	});
	e && e.preventDefault();
}

function restoreOptions() {
	browserAppData.storage.local.get({
		inspector: true,
		clipboard: true,
		shortid: true,
		position: 'bl',
		shortcut: 'U'
	}, items => {
		document.querySelector('#inspector').checked = items.inspector;
		document.querySelector('#copy').checked = items.clipboard;
		document.querySelector('#shortid').checked = items.shortid;
		document.querySelector('#position').value = items.position;
		document.querySelector('#shortcut').value = items.shortcut;
	});
}

// update shortcut string in options box
document.querySelector('.command').textContent = shortCutLabels;

// check if browser support updating shortcuts
if (updateAvailable) {
	document.querySelector('#reset').addEventListener('click', resetShortcut);
	document.querySelector('#shortcut').addEventListener('keyup', shortcutKeyField);
} else {
  // remove button and disable input field
	document.querySelector('#reset').remove();
	document.querySelector('#shortcut').setAttribute('disabled', 'true');
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
