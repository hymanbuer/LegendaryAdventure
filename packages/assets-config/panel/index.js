
const fs = require('fs');

// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
    // css style for panel
    style: fs.readFileSync(Editor.url('packages://assets-config/panel/style.css'), 'utf-8'),

    // html template for panel
    template: fs.readFileSync(Editor.url('packages://assets-config/panel/template.html'), 'utf-8'),

    // element and variable binding
    $: {

    },

    // method executed when template and styles are successfully loaded and initialized
    ready () {
        
    },

    // register your ipc messages here
    messages: {
        AA () {
            Editor.log('panel received:', 'AA');
        },
        BB () {
            Editor.log('panel received:', 'BB');
        },
        CC () {
            Editor.log('panel received:', 'CC');
        },
    },

    // register your DOM messages here
    listeners: {
        contextmenu (e) {
            e.preventDefault(), e.stopPropagation();
            Editor.Ipc.sendToMain('assets-config:popup-context-menu', e.clientX, e.clientY);
        }
    },
});