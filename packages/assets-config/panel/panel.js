/**
 * TODO:
 * - 检查保存的路径是否在db://assets/下
 * - 检查打开的文件的有效性
 * - 选择对比两个文件，左右覆盖（移动）Item
 * - 复制一个或多个Item
 * - 复制整个文件
 */

(function () {
"use strict";

const FS = require('fire-fs');
const Path = require('fire-path');

function xxlog(...args) {
    Editor.Ipc.sendToMain('editor:renderer-console-log', ...args);
};

function preventAndStop(e) {
    e && e.preventDefault && e.preventDefault();
    e && e.stopPropagation && e.stopPropagation();
}

Editor.polymerPanel("assets-config", {
    properties: {
        searchPattern: {
            type: String,
            value: "",
            observer: "_onSearchPatternChanged",
        },
        tipsText: {
            type: String,
            value: "",
        }
    },

    listeners: {
        "assets-item-focus": "_onAssetsItemFocus",
        "assets-item-blur": "_onAssetsItemBlur",
        "active-tag-file": "_onActiveTagFile",
        "close-tag-file": "_onCloseTagFile",
        "assets-content-change": "_onAssetsContentChange",

        "contextmenu": "onContextMenu",
        "mousedown": "onMouseDown",
    },

    messages: {
        "close-file" (_, index) {
            const tag = Polymer.dom(this.$.fileTags).children[index];
            this._checkCloseFile(tag);
        },

        "close-others" (_, index) {
            const children = Polymer.dom(this.$.fileTags).children;
            const tags = children.filter((_, i) => i !== index);
            tags.forEach(tag => this._checkCloseFile(tag));
        },

        "close-to-the-right" (_, index) {
            const children = Polymer.dom(this.$.fileTags).children;
            const tags = children.filter((_, i) => i > index);
            tags.forEach(tag => this._checkCloseFile(tag));
        },

        "close-all" (_, index) {
            const children = Polymer.dom(this.$.fileTags).children;
            children.forEach(tag => this._checkCloseFile(tag));
        },

        "new-file" (_, index) {
            this.newFile();
        },

        "open-file" (_, index) {
            this.openFile();
        },

        "save-file" (_, index) {
            const tag = Polymer.dom(this.$.fileTags).children[index];
            this._saveFile(tag);
        },

        "save-file-as" (_, index) {
            const tag = Polymer.dom(this.$.fileTags).children[index];
            this._saveFileAs(tag);
        },

        "save-all-file" (_, index) {
            const children = Polymer.dom(this.$.fileTags).children;
            children.filter(tag => tag.dirty)
                    .forEach(tag => this._saveFile(tag));
        },

        "sort-by-id" (_, index) {
            if (this._activeFileTag) {
                this._activeFileTag.content.sortById();
            }
            if (!this.$.searchResult.hidden) {
                this.$.searchResult.sortById();
            }
        },

        "sort-by-type" (_, index) {
            if (this._activeFileTag) {
                this._activeFileTag.content.sortByType();
            }
            if (!this.$.searchResult.hidden) {
                this.$.searchResult.sortByType();
            }
        },

        "selection:selected" (e, type, ids) {
            type === 'xxasset' && ids.forEach(id => {
                Polymer.dom(this.$.contents).children.forEach(content =>
                    content.selectItemById(id)
                );
            });
        },

        "selection:unselected" (e, type, ids) {
            type === 'xxasset' && ids.forEach(id => {
                Polymer.dom(this.$.contents).children.forEach(content =>
                    content.unselectItemById(id)
                );
            });
        },

        "selection:activated" (e, type, id) {
            if (type === 'xxasset' && id) {
                Polymer.dom(this.$.contents).children.forEach(content =>
                    content.activeItemById(id)
                );
            }
        },

        "selection:deactivated" (e, type, id) {
            if (type === 'xxasset' && id) {
                Polymer.dom(this.$.contents).children.forEach(content =>
                    content.deactiveItemById(id)
                );
            }
        },
    },

    "panel-ready" () {
        const lastOpenedFiles = this.profiles.local.data["last-opened-files"];
        const lastEditFile = this.profiles.local.data["last-edit-file"];
        if (lastOpenedFiles && lastOpenedFiles.length > 0) {
            lastOpenedFiles.forEach(path => {
                const tag = typeof path == 'object' ? this._restoreFile(path) : this._doOpenFile(path);
                if (tag && path === lastEditFile) {
                    this._activateFile(tag);
                }
            });

            if (Polymer.dom(this.$.fileTags).children) {
                if (!this._activeFileTag) {
                    this._activateFile(Polymer.dom(this.$.fileTags).children[0]);
                }
            }
        } else {
            this._showHomePage(true);
        }
    },

    close () {
        const lastOpenedFiles = [];
        Polymer.dom(this.$.fileTags).children.forEach(tag => {
            this._checkSaveFile(tag);
            if (!tag.dirty && tag.path) {
                lastOpenedFiles.push(tag.path);
            } else {
                lastOpenedFiles.push({
                    title: tag.title,
                    name: tag.filename,
                    assets: tag.content.dumpItems(),
                    dirty: tag.dirty,
                    active: this._activeFileTag === tag,
                    path: tag.path,
                });
            }
        });
        this.profiles.local.data["last-opened-files"] = lastOpenedFiles;

        if (this._activeFileTag) {
            this.profiles.local.data["last-edit-file"] = this._activeFileTag.path;
        }
        this.profiles.local.save();
    },

    onContextMenu (e) {
        preventAndStop(e);
        if (this._activeFileTag) {
            const index = Polymer.dom(this.$.fileTags).children.indexOf(this._activeFileTag);
            Editor.Ipc.sendToMain('assets-config:popup-context-menu', e.clientX, e.clientY, index);
        }
    },

    onMouseDown (e) {
        e.stopPropagation();
        if (e.which === 1 && this._activeFileTag) {
            this._activeFileTag.content.clearSelection();
        }
    },

    onSaveCurrentFile (e) {
        preventAndStop(e);
        this.saveCurrentFile();
    },

    onOpenFileInExplorer (e) {
        preventAndStop(e);
        this.openFile();
    },

    onNewFile (e) {
        preventAndStop(e);
        this.newFile();
    },

    onDeleteCurrentSelected (e) {
        preventAndStop(e);
        const ids = Editor.Selection.curSelection('xxasset');
        this._deleteItemsInCurrentFile(ids);
    },

    onSelectAllItems (e) {
        preventAndStop(e);
        if (this._activeFileTag) {
            this._activeFileTag.content.selectAllItems();
        }
    },

    saveCurrentFile () {
        if (this._activeFileTag && !this.$.contents.hidden) {
            this._saveFile(this._activeFileTag);
        }
    },

    openFile () {
        let paths = Editor.Dialog.openFile({
            title: "Open Assets Config",
            defaultPath: this.profiles.local.data["last-open-path"] || Editor.url("db://assets"),
            filters: [{
                name: "Assets Config",
                extensions: ["json"]
            }],
        });
        if (paths && paths[0]) {
            const children = Polymer.dom(this.$.fileTags).children;
            const index = children.findIndex(tag => tag.path === paths[0]);
            const tag = index !== -1 ? children[index] : this._doOpenFile(paths[0]);
            if (tag) {
                this.profiles.local.data["last-open-path"] = Path.dirname(paths[0]);
                this.profiles.local.save();
                this._activateFile(tag);
            }
        }
    },

    newFile () {
        this._activateFile(this._addAssetsContent());
    },

    _onAssetsItemFocus (e) {
        const info = Editor.assetdb.remote.assetInfoByUuid(e.detail);
        const url = info.url.substring(0, info.url.lastIndexOf('.'));
        this.tipsText = url;
    },

    _onAssetsItemBlur (e) {
        this.tipsText = '';
    },

    _onClickOpen () {
        this.openFile();
    },

    _onClickCreate () {
        this.newFile();
    },

    _onDoubelClickTagsBar () {
        this.newFile();
    },

    _onActiveTagFile (e) {
        if (e.target !== this._activeFileTag) {
            this._activateFile(e.target);
        }
    },

    _onCloseTagFile (e) {
        const tag = e.target;
        this._checkCloseFile(tag);
    },

    _onAssetsContentChange (e) {
        const content = e.target;
        if (this._activeFileTag && this._activeFileTag.content === content) {
            this._activeFileTag.dirty = true;
        }
    },

    _checkCloseFile (tag) {
        if (this._checkSaveFile(tag) !== 2) {
            this._closeFile(tag);
        }
    },

    _checkSaveFile (tag) {
        if (tag && tag.dirty) {
            const id = Editor.Dialog.messageBox({
                type: "warning",
                buttons: ["Save", "Don't Save", "Cancel"],
                title: "Assets Config",
                message: `Do you want to save the changes you made to ${tag.filename}.json?`,
                detail: "You changes will be lost if you don't save them.",
                noLink: !0,
                defaultId: 0,
                cancelId: 2
            });
            if (id === 0) {
                this._saveFile(tag);
            }
            return id;
        }
    },

    _closeFile (tag) {
        if (this._activeFileTag === tag) {
            const tags = Polymer.dom(this.$.fileTags).children;
            if (tags.length > 1) {
                const index = tags.indexOf(tag);
                const nextTag = index > 0 ? tags[index - 1] : tags[1];
                this._activateFile(nextTag);
            } else {
                this._showHomePage(true);
                this._activeFileTag = null;
            }
        }
        if (tag) {
            Polymer.dom(this.$.fileTags).removeChild(tag);
            Polymer.dom(this.$.contents).removeChild(tag.content);
        }
    },

    _doOpenFile (path) {
        try {
            // TODO: verify config
            const data = FS.readFileSync(path, 'utf-8');
            const config = JSON.parse(data);
            const tag = this._addAssetsContent();
            tag.path = path;
            tag.title = path;
            tag.filename = config.name;
            tag.content.restoreItems(config.assets);
            
            return tag;
        } catch (err) {
            Editor.error(`invalid file ${path}:`, err);
        }
    },

    _restoreFile (config) {
        const tag = this._addAssetsContent();
        tag.path = config.path;
        tag.title = config.title;
        tag.filename = config.name;
        tag.content.restoreItems(config.assets);
        tag.dirty = config.dirty;
        if (config.active) {
            this._activateFile(tag);
        }
        return tag;
    },

    _saveFile (tag) {
        let path = tag.path;
        if (!path) {
            path = Editor.Dialog.saveFile({
                title: "Save Assets Config",
                defaultPath: this.profiles.local.data["last-open-path"] || Editor.url("db://assets"),
                filters: [{
                    name: "Assets Config",
                    extensions: ["json"]
                }],
            });
        }
        if (path && path !== -1) {
            this._doSaveFile(tag, path);
        }
    },

    _saveFileAs (tag) {
        const path = Editor.Dialog.saveFile({
            title: "Save as...",
            defaultPath: tag.path || this.profiles.local.data["last-open-path"] || Editor.url("db://assets"),
            filters: [{
                name: "Assets Config",
                extensions: ["json"]
            }],
        });
        if (path && path !== -1) {
            this._doSaveFile(tag, path);
        }
    },

    async _doSaveFile (tag, path) {
        const config = {
            version: '0.0.1',
            name: Path.basenameNoExt(path),
        };
        config.assets = tag.content.dumpItems();

        try {
            // when window closed, ipc will don't reply, so I move the changes forward
            const data = JSON.stringify(config);
            tag.path = path;
            tag.title = path;
            tag.filename = Path.basenameNoExt(path);
            tag.dirty = false;
            await save(path, data);
        } catch (err) {
            tag.dirty = true;
            Editor.error(err);
        };

        function save(path, data) {
            return new Promise((resolve, reject) => {
                Editor.Ipc.sendToMain('assets-config:save-file', path, data, (err, asset) => {
                    err ? reject(err) : resolve(asset);
                }, -1)
            });
        }
    },

    _addAssetsContent () {
        const tag = document.createElement('tag-file');
        Polymer.dom(this.$.fileTags).appendChild(tag);
        
        const content = document.createElement('xxassets-content');
        content.classList.add('fit');
        content.setAttribute('droppable', 'file,asset');
        Polymer.dom(this.$.contents).appendChild(content);

        tag.content = content;
        tag.active = false;
        tag.content.hidden = true;

        return tag;
    },

    _activateFile (tag) {
        if (this._activeFileTag) {
            this._activeFileTag.active = false;
            this._activeFileTag.content.hidden = true;
            this._activeFileTag = null;
        }
        if (tag) {
            tag.active = true;
            tag.content.hidden = false;
            this._activeFileTag = tag;
            this._showHomePage(false);
            this._onSearchPatternChanged();
        }
    },

    _deleteItemsInCurrentFile (ids) {
        if (this._activeFileTag) {
            this._activeFileTag.content.removeItems(ids);
        }
    },

    _onSearchPatternChanged () {
        if (this.searchPattern) {
            this.$.searchResult.hidden = false;
            this.$.contents.hidden = true;
            this.$.searchResult.clearItems();
            this.$.searchResult.searchItems(this._activeFileTag.content, this.searchPattern);
        } else {
            this.$.searchResult.hidden = true;
            this.$.contents.hidden = false;
            this.$.searchResult.clearItems();
        }
    },

    ///////////////////////////////////////////

    _showHomePage (isShow) {
        this.$.view.hidden = isShow;
        this.$.none.hidden = !isShow;
    }
});

})();