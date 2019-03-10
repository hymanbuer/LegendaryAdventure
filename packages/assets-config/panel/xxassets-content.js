(() => {
"use strict";

const fs = require('fire-fs');
const path = require('fire-path');

const { xxlog } = Editor.require('packages://assets-config/utils');

function sortChildren(element, compare) {
    const domApi = Polymer.dom(element);
    const list = domApi.children.slice();
    list.forEach(child => domApi.removeChild(child));
    list.sort(compare);
    list.forEach(child => domApi.appendChild(child));
}

function clearChildren(element) {
    const domApi = Polymer.dom(element);
    while (domApi.firstChild) {
        domApi.removeChild(domApi.firstChild);
    }
}

const filterTypes = new Set([
    'folder', 'scene', 'javascript', 'coffeescript', 'typescript',
]);

const dirFilesCache = new Map();
function readdirSync(dir) {
    if (dirFilesCache.has(dir)) {
        return dirFilesCache.get(dir);
    } else if (!fs.isDirSync(Editor.url(dir))) {
        return [];
    } else {
        const ret = fs.readdirSync(Editor.url(dir))
            .filter(filename => path.extname(filename) !== '.meta')
            .map(filename => dir + '/' + filename);
        dirFilesCache.set(dir, ret);
        return ret;
    }
}

function defaultId(url) {
    let id = url.substring(0, url.lastIndexOf('.'));
    id = id.substring(5);   // extract 'db://'
    return id.replace(/\//g, '.');
}

Editor.polymerElement({
    behaviors: [Editor.UI.Droppable],

    listeners: {
        "drop-area-move": "_onDropAreaMove",
        "drop-area-enter": "_onDropAreaEnter",
        "drop-area-leave": "_onDropAreaLeave",
        "drop-area-accept": "_onDropAreaAccept",
        "id-change-confirm": "_onIdChangeConfirm",

        "item-selecting": "onItemSelecting",
        "item-select": "onItemSelect",
    },

    properties: {
        
    },

    ready () {
        this.multi = true;
        this._initDroppable(this);

        this._handledUuids = new Set();
        this._uuid2item = new Map();
        this._id2item = new Map();

        this._shiftStartItem = null;
        this._activeItem = null;
    },

    dumpItems () {
        const ret = {};
        Polymer.dom(this.$.content).children.forEach(item => {
            ret[item.id] = item.getTypes();
        });
        return ret;
    },

    restoreItems (config) {
        if (typeof config != 'object') return;

        for (let id in config) {
            const infos = config[id];
            const assetsItem = this._appendAssetsItem(id);
            infos.forEach(icon => this._addToItem(assetsItem, icon.uuid, icon.name));
            assetsItem.sort();
        }
    },

    clearItems () {
        clearChildren(this.$.content);
        this._handledUuids.clear();
        this._uuid2item.clear();
        this._id2item.clear();
        this.fire('assets-content-change');
    },

    sortById () {
        sortChildren(this.$.content, (a, b) => a.id > b.id);
    },

    sortByType () {
        sortChildren(this.$.content, (a, b) => {
            const typesA = a.getTypes();
            const typesB = b.getTypes();
            return typesA[0].name > typesB[0].name 
                || (typesA[0].name === typesB[0].name && a.id > b.id);
        });
    },

    searchItems (content, pattern) {
        const config = content.dumpItems()
        for (let id in config) {
            if (!id.match(pattern)) {
                delete config[id];
            }
        }
        this.restoreItems(config);
    },

    _onDropAreaMove (e) {
        e.stopPropagation();
    },

    _onDropAreaEnter (e) {
        e.stopPropagation();
    },

    _onDropAreaLeave (e) {
        e.stopPropagation();
    },

    _onDropAreaAccept (e) {
        e.stopPropagation();
        if (e.detail.dragType !== 'asset') return;

        e.detail.dragItems.forEach(item => {
            if (this._handledUuids.has(item.id))
                this._uuid2item.get(item.id).hint();
        });

        let dirtyFlag = false;
        e.detail.dragItems.forEach(item => {
            if (!this._handledUuids.has(item.id)) {
                this._handleDragItem(item);
                dirtyFlag = true;
            }
        });
        if (dirtyFlag) {
            this.fire('assets-content-change');
        }
    },

    _handleDragItem (item) {
        const info = Editor.assetdb.remote.assetInfoByUuid(item.id);
        if (filterTypes.has(info.type)) return;

        const assetsItem = this._appendAssetsItem(defaultId(info.url));
        if (info.isSubAsset) {
            this._addToItem(assetsItem, info.uuid, info.type);
            if (info.type === 'sprite-frame') {
                const parentInfo = Editor.assetdb.remote.assetInfo(path.dirname(info.url));
                if (parentInfo.type === 'texture')
                    this._addToItem(assetsItem, parentInfo.uuid, parentInfo.type);
            }
        } else {
            const name = path.basenameNoExt(info.url);
            const list = readdirSync(path.dirname(info.url))
                .filter(url => path.basenameNoExt(url) === name);
            list.forEach(url => {
                const info = Editor.assetdb.remote.assetInfo(url);
                this._addToItem(assetsItem, info.uuid, info.type);
            });
        }
        assetsItem.sort();
    },

    _addToItem (assetsItem, uuid, type) {
        if (this._handledUuids.has(uuid) || filterTypes.has(type)) return;

        this._handledUuids.add(uuid);
        this._uuid2item.set(uuid, assetsItem);
        assetsItem.addIcon(uuid, type);
        if (type === 'texture') {
            const infos = Editor.assetdb.remote.subAssetInfosByUuid(uuid);
            this._addToItem(assetsItem, infos[0].uuid, infos[0].type);
        }
    },

    _appendAssetsItem (id) {
        const assetsItem = document.createElement('xxassets-item');
        Polymer.dom(this.$.content).appendChild(assetsItem);
        assetsItem.setId(id);
        this._id2item.set(id, assetsItem);
        return assetsItem;
    },

    _onIdChangeConfirm (e) {
        e.stopPropagation();
        const detail = e.detail;
        const children = Polymer.dom(this.$.content).children;
        const target = children.find(item => item.id === detail.newId);
        if (target) {
            detail.item.setId(detail.oldId);
            target.hint();
            Editor.error(`${detail.newId} exist!`);
        } else {
            detail.item.setId(detail.newId);
            this._updateItemId(detail.item, detail.oldId, detail.newId);
            this.fire('assets-content-change');
        }
    },

    _updateItemId (item, oldId, newId) {
        this._id2item.delete(oldId);
        this._id2item.set(newId, item);
    },

    _getShiftSelects (target) {
        this._shiftStartItem = this._shiftStartItem || target;
        const children = Polymer.dom(this.$.content).children;
        let start = children.indexOf(this._shiftStartItem);
        let end = children.indexOf(target);
        if (start > end) {
            [start, end] = [end, start];
        }
        const ids = [];
        for (let i = start; i <= end; i++) {
            ids.push(children[i].id);
        }

        return ids;
    },

    onItemSelecting (e) {
        e.stopPropagation();
        const target = e.target;
        const last = this._shiftStartItem;
        this._shiftStartItem = null;
        if (e.detail.shift) {
            this._shiftStartItem = last ? last : this._activeItem;
            const ids = this._getShiftSelects(target);
            Editor.Selection.select('xxasset', ids, true, false);
        } else if (e.detail.toggle) {
            if (target.selected) {
                Editor.Selection.unselect('xxasset', target.id, false);
            } else {
                Editor.Selection.select('xxasset', target.id, false, false);
            }
        } else if (!target.selected) {
            Editor.Selection.select('xxasset', target.id, true, false);
        }
    },

    onItemSelect (e) {
        e.stopPropagation();
        if (e.detail.shift || e.detail.toggle) {
            Editor.Selection.confirm();
        } else {
            Editor.Selection.select('xxasset', e.target.id, true);
        }
    },

    selectItemById (id) {
        const item = this._id2item.get(id);
        if (item) {
            item.selected = true;
        }
    },

    unselectItemById (id) {
        const item = this._id2item.get(id);
        if (item) {
            item.selected = false;
        }
    },

    removeItems (ids) {
        ids.forEach(id => this.removeItemById(id));
    },

    removeItemById (id) {
        const item = this._id2item.get(id);
        if (item) {
            const types = item.getTypes();
            types.forEach(icon => {
                this._handledUuids.delete(icon.uuid);
                this._uuid2item.delete(icon.uuid);
            });
            this._id2item.delete(id);
            Polymer.dom(this.$.content).removeChild(item);
            this.fire('assets-content-change');
        }
    },

    activeItemById (id) {
        const item = this._id2item.get(id);
        if (item) {
            this._activeItem = item;
        }
    },

    deactiveItemById (id) {
        if (this._activeItem && this._activeItem.id === id) {
            this._activeItem = null;
        }
    },

    activeItem (item) {
        this._activeItem = item;
    },

    deactiveItem (item) {
        if (item && this._activeItem === item) {
            this._activeItem = null;
        }
    },

    clearSelection () {
        this._activeItem = null;
        this._shiftStartItem = null;
        Editor.Selection.clear("xxasset");
    },

    selectAllItems () {
        const children = Polymer.dom(this.$.content).children;
        const ids = children.map(child => child.id);
        if (ids.length > 0) {
            Editor.Selection.select("xxasset", ids, true, true);
        }
    },
});

})();