(function () {
"use strict";

const { xxlog } = Editor.require('packages://assets-config/utils');

function sortChildren(element, compare) {
    const domApi = Polymer.dom(element);
    const list = [];
    while (domApi.firstChild) {
        list.push(domApi.firstChild);
        domApi.removeChild(domApi.firstChild);
    }
    list.sort(compare);
    list.forEach(e => domApi.appendChild(e));
}

const weightMap = new Map([
    ["spine", 3],
    ["dragonbones", 3],
    ["prefab", 3],
    ["tiled-map", 3],

    ["sprite-atlas", 2],
    ["auto-atlas", 2],
    ["dragonbones-atlas", 2],
    ["text", 2],
    ["bitmap-font", 2],
    ["label-atlas", 2],
    ["ttf-font", 2],

    ["texture", 1],

    ["sprite-frame", 0],
]);
function typeWeight(type) {
    return weightMap.has(type) && weightMap.get(type) || 0;
}

function sortCompare(a, b) {
    return typeWeight(a.title) < typeWeight(b.title);
}

const name2assettype = {
    'sprite-atlas': 'cc.SpriteAtlas',
    'auto-atlas': 'cc.SpriteAtlas',
};
for (let type in Editor.assettype2name) {
    const name = Editor.assettype2name[type];
    name2assettype[name] = type;
}

Editor.polymerElement({
    properties: {
        selected: {
            type: Boolean,
            value: false,
            notify: true,
            reflectToAttribute: true,
        }
    },

    listeners: {
        mousedown: "onMouseDown",
        click: "onClickItem",
    },

    ready () {
        
    },

    setId (id) {
        this.$.idInput.value = id;
        this.setAttribute('id', id);
    },

    getTypes () {
        const ret = [];
        Polymer.dom(this.$.types).children.forEach(icon => {
            const config = {};
            config.uuid = icon.uuid;
            config.type = name2assettype[icon.type];        // e.g. type -> "cc.Texture2D"
            config.name = icon.type;                        // e.g. name -> "texture"
            ret.push(config);
        });
        return ret;
    },

    addIcon (uuid, type) {
        const icon = document.createElement('div');
        icon.setAttribute('class', 'icon');
        icon.setAttribute('title', type);
        icon.uuid = uuid;
        icon.type = type;
        this._setIcon(icon, uuid, type);
        Polymer.dom(this.$.types).appendChild(icon);
    },

    hint (color, duration) {
        color = color || "white";
        duration = duration || 1e3;

        if (this._anim) {
            this._anim.cancel();
            this._anim = null;
        }

        let style = window.getComputedStyle(this.$.item);
        this._anim = this.$.item.animate([{
            background: color,
        }, {
            background: style.backgroundColor,
        }], {
            duration: duration
        });
        this._anim.onfinish = () => {
            this._anim = null;
        };
    },

    sort () {
        sortChildren(this.$.types, sortCompare);
    },

    _setIcon (icon, uuid, type) {
        if (type === 'texture') {
            let url = `url("thumbnail://${uuid}?32")`;
            icon.style.backgroundImage = url;
        } else if (type === 'sprite-frame') {
            var self = this;
            Editor.assetdb.queryMetaInfoByUuid(uuid, (err, info) => {
                if (err || !info) {
                    self._useDefaultIcon(icon, type);
                } else {
                    self._drawFrameIcon(icon, JSON.parse(info.json));
                }
            });
        } else {
            this._useDefaultIcon(icon, type);
        }
    },

    _useDefaultIcon(icon, type) {
        let meta = Editor.metas[type];
        let url = meta && meta['asset-icon'] ? meta['asset-icon']
            : `packages://assets/static/icon/${type}.png`;
        icon.style.backgroundImage = `url("${url}")`;
    },

    _drawFrameIcon(icon, info) {
        let url = `thumbnail://${info.rawTextureUuid}?32`,
            trimX = info.trimX,
            trimY = info.trimY,
            width = info.width,
            height = info.height,
            rotation = info.rotated ? 270 : 0,
            str = `&x=${trimX}&y=${trimY}&w=${width}&h=${height}`;
        if (rotation !== 0) str += `&rotate=${rotation}`;

        url = `url("${url + str}")`;
        icon.style.backgroundImage = url;
    },

    _onFocus () {
        const firstChild = Polymer.dom(this.$.types).firstChild;
        if (firstChild) {
            // Editor.Ipc.sendToAll('assets:hint', firstChild.uuid);
            this.fire('assets-item-focus', firstChild.uuid);
        }
    },

    _onBlur () {
        this.fire('assets-item-blur');
    },

    _onIdConfirm () {
        this.fire('id-change-confirm', {
            item: this,
            newId: this.$.idInput.value,
            oldId: this.id,
        });
    },

    onClickAssets (e) {
        const firstChild = Polymer.dom(this.$.types).firstChild;
        if (firstChild) {
            Editor.Ipc.sendToAll('assets:hint', firstChild.uuid);
            this.fire('assets-item-focus', firstChild.uuid);
        }
    },

    onMouseDown (e) {
        const info = this._checkSelect(e);
        if (info) {
            this.fire('item-selecting', info);
        }
    },

    onClickItem (e) {
        const info = this._checkSelect(e);
        if (info) {
            this.fire('item-select', info);
        }
    },

    _checkSelect (e) {
        if (e.which !== 1) {
            return;
        }
        e.stopPropagation();

        let shift = false,
            toggle = false;
        if (e.shiftKey) {
            shift = true;
        } else {
            toggle = e.metaKey || e.ctrlKey;
        }
        return { shift, toggle };
    },

}); // Editor.polymerElement

})(); // end module