'use strict';

const BrowserWindow = require('electron').BrowserWindow;
const FS = require('fs');
const Path = require('path');

function popupMenu(webContents, template, x, y) {
    const menu = new Editor.Menu(template, webContents);
    x = Math.floor(x), y = Math.floor(y);
    menu.nativeMenu.popup(BrowserWindow.fromWebContents(webContents, x, y));
    menu.dispose();
}

module.exports = {

// execute when package loaded
load () {
    Editor.Selection.register('xxasset');
},

// execute when package unloaded
unload () {

},

// register your ipc messages here
messages: {
    'open' () {
        // open entry panel registered in package.json
        Editor.Panel.open('assets-config');
    },

    'popup-context-menu' (e, x, y, index) {
        const sendMessage = msg => () => {
            Editor.Ipc.sendToPanel('assets-config', msg, index);
        };
        const template = [
            {
                label: 'New File',
                click: sendMessage('new-file'),
                accelerator: 'CmdOrCtrl+N',
            },
            {
                label: 'Open File...',
                click: sendMessage('open-file'),
                accelerator: 'CmdOrCtrl+O',
            },
            {
                type: "separator",
            },
            {
                label: 'Save',
                click: sendMessage('save-file'),
                accelerator: 'CmdOrCtrl+S',
            },
            {
                label: 'Save as...',
                click: sendMessage('save-file-as'),
            },
            {
                label: 'Save All',
                click: sendMessage('save-all-file'),
            },
            {
                type: "separator",
            },
            {
                label: 'Sort by ID',
                click: sendMessage('sort-by-id'),
            },
            {
                label: 'Sort by Type',
                click: sendMessage('sort-by-type'),
            },
        ];
        popupMenu(e.sender, template, x, y);
    },

    'popup-file-menu' (e, x, y, index) {
        const sendMessage = msg => () => {
            Editor.Ipc.sendToPanel('assets-config', msg, index);
        };
        const template = [
            {
                label: 'Close',
                click: sendMessage('close-file'),
            },
            {
                label: 'Close Others',
                click: sendMessage('close-others'),
            },
            {
                label: 'Close to the Right',
                click: sendMessage('close-to-the-right'),
            },
            {
                label: 'Close All',
                click: sendMessage('close-all'),
            },
        ];
        popupMenu(e.sender, template, x, y);
    },

    'save-file' (event, path, data) {
        const relative = Path.relative(Editor.url('db://assets/'), path);
        const url = 'db://assets/' + relative;
        if (FS.existsSync(path)) {
            Editor.assetdb.saveExists(url, data, event.reply);
        } else {
            Editor.assetdb.create(url, data, event.reply);
        }
    },
},

}; // end module.exports