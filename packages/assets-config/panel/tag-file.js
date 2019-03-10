(function () {
"use strict";

function xxlog(...args) {
    Editor.Ipc.sendToMain('editor:renderer-console-log', ...args);
};

const IconState = {
    None: 0,
    Close: 1,
    Change: 2,
};

Editor.polymerElement({
    properties: {
        filenameText: {
            type: String,
            value: "untitled",
        },
    },

    listeners: {
        contextmenu: "_onContextMenu",
    },
    
    ready () {
        this.title = 'untitled';
        this.active = false;
        this.dirty = false;
    },

    get active () {
        return this._active;
    },
    set active (value) {
        // const classList = this.$.root.classList;
        // classList.remove('inactive');
        // classList.remove('active');
        // classList.add(value ? 'active' : 'inactive');
        this._active = value;
        this._updateIconState();
    },

    get dirty () {
        return this._dirty;
    },
    set dirty (value) {
        this.$.iconChange.hidden = !value;
        this._dirty = value;
        this._updateIconState();
    },

    get filename () {
        return this.filenameText;
    },
    set filename (value) {
        this.filenameText = value;
    },

    _onClickTag (e) {
        e.stopPropagation();
        if (this.path && this.active) {
            const uuid = Editor.assetdb.remote.fspathToUuid(this.path);
            Editor.Ipc.sendToAll('assets:hint', uuid);
        }
        this.fire('active-tag-file');
    },

    _onOverTag () {
        this._updateIconState(true);
    },

    _onOutTag () {
        this._updateIconState(false);
    },

    _onOverIcon (e) {
        e.stopPropagation();
        this._setIconState(IconState.Close);
    },

    _onOutIcon (e) {
        e.stopPropagation();
        this._updateIconState(false);
    },

    _onClickClose (e) {
        e.stopPropagation();
        this.fire('close-tag-file');
    },

    _updateIconState (over) {
        if (this._active) {
            this._setIconState(this._dirty ? IconState.Change : IconState.Close);
        } else if (this._dirty) {
            this._setIconState(IconState.Change);
        } else if (over) {
            this._setIconState(IconState.Close);
        } else {
            this._setIconState(IconState.None);
        }
    },

    _setIconState (state) {
        this.$.iconChange.hidden = true;
        this.$.iconClose.hidden = true;
        if (state === IconState.Close) {
            this.$.iconClose.hidden = false;
        } else if (state === IconState.Change) {
            this.$.iconChange.hidden = false;
        }
    },

    _onDblClickTag (e) {
        e.stopPropagation();
    },

    _onContextMenu (e) {
        e.preventDefault(), e.stopPropagation();

        const target = Polymer.dom(e).localTarget;
        const children = target.parentNode.children;
        let index = -1;
        for (let i = 0; i < children.length; ++i) {
            if (target === children[i]) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            Editor.Ipc.sendToMain('assets-config:popup-file-menu', e.clientX, e.clientY, index);
        }
    },

    _rootClass (active) {
        return active ? 'active' : 'inactive';
    },
});

})(); // end module