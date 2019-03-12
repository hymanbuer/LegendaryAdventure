
const assettype2name = { 
    'cc.Asset': 'native-asset',
    'cc.AnimationClip': 'animation-clip',
    'cc.AudioClip': 'audio-clip',
    'cc.BitmapFont': 'bitmap-font',
    'cc.CoffeeScript': 'coffeescript',
    'cc.TypeScript': 'typescript',
    'cc.JavaScript': 'javascript',
    'cc.JsonAsset': 'json',
    'cc.ParticleAsset': 'particle',
    'cc.Prefab': 'prefab',
    'cc.SceneAsset': 'scene',
    'cc.SpriteAtlas': 'sprite-atlas',
    'cc.SpriteFrame': 'sprite-frame',
    'cc.Texture2D': 'texture',
    'cc.TTFFont': 'ttf-font',
    'cc.TextAsset': 'text',
    'cc.LabelAtlas': 'label-atlas',
    'cc.RawAsset': 'raw-asset',
    'cc.Script': 'script',
    'cc.Font': 'font',
    'sp.SkeletonData': 'spine',
    'cc.TiledMapAsset': 'tiled-map',
    'dragonBones.DragonBonesAsset': 'dragonbones',
    'dragonBones.DragonBonesAtlasAsset': 'dragonbones-atlas'
};

const name2assettype = {};
for (let key in assettype2name) {
    const value = assettype2name[key];
    name2assettype[value] = key;
}

function getResByUuid (uuid) {
    const url = cc.AssetLibrary.getLibUrlNoExt(uuid) + '.json';
    return cc.loader.getRes(url);
}

function loadResByUuid (uuid) {
    return new Promise((resolve, reject) => {
        cc.loader.load({ type: 'uuid', uuid: uuid }, null, (err, asset) => {
            if (err)
                reject(err);
            else
                resolve(asset);
        });
    });
}

/**
 * 游戏中所有需用用到的资源均使用get或load获取，以便统一检查代码中使用资源的情况
 */
const Assets = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        assetsConfigList: [cc.JsonAsset],
    },

    onLoad () {
        Assets.instance = this;
        this._assetsConfigList = [];
        for (let asset of this.assetsConfigList) {
            this.addAssetsConfig(asset.json);
        }
    },

    onDestroy () {
        Assets.instance = null;
    },

    addAssetsConfig: function (config) {
        this._assetsConfigList.push(config);
    },

    removeAssetsConfig: function (name) {
        if (typeof name === 'object')
            name = name.name;

        for (let i = 0; i < this._assetsConfigList.length; i++) {
            if (this._assetsConfigList[i].name === name) {
                return this._assetsConfigList.splice(i, 1);
            }
        }
    },

    clearAssetsConfig: function () {
        this._assetsConfigList = [];
    },

    get: function (id, type) {
        const config = this._getConfig(id, type);
        if (!config) return null;
        else return getResByUuid(config.uuid);
    },

    load: function (id, type) {
        const config = this._getConfig(id, type);
        if (!config) return Promise.reject(`${id} ${type} don't exist`);
        else return loadResByUuid(config.uuid);
    },

    /////////////////////////////

    _getConfig: function (id, type) {
        const assetsConfig = this._getAssetsConfig(id);
        if (!assetsConfig) return null;
    
        if (type === undefined) {
            return assetsConfig[0];
        }
    
        const target = this._getType(type);
        for (let config of assetsConfig) {
            if (target === this._getType(config.type)) {
                return config;
            }
        }
    
        return null;
    },

    _getAssetsConfig: function (id) {
        if (typeof id !== 'string') return null;
    
        const index = id.indexOf(':');
        let packageName;
        if (index !== -1) {
            packageName = id.substring(0, index);
            id = substring(index + 1);
        }
    
        for (let assetsConfig of this._assetsConfigList) {
            if (!packageName || assetsConfig.name === packageName) {
                return assetsConfig.assets[id];
            }
        }
        return null;
    },

    _getType: function (type) {
        if (typeof type === 'string') {
            type = name2assettype[type] || type;
            type = cc.js.getClassByName(type);
        }
        return type;
    },
});
