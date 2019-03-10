
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

let assetsConfigList = [];

function getAssetConfig(id) {
    if (typeof id !== 'string') return null;

    const index = id.indexOf(':');
    let packageName;
    if (index !== -1) {
        packageName = id.substring(0, index);
        id = substring(index + 1);
    }

    for (let assetsConfig of assetsConfigList) {
        if (!packageName || assetsConfig.name === packageName) {
            return assetsConfig.assets[id];
        }
    }
    return null;
}

function getConfig(id, type) {
    const assetConfig = getAssetConfig(id);
    if (!assetConfig) return null;

    if (type === undefined) {
        return assetConfig[0];
    }

    const target = getType(type);
    for (let config of assetConfig) {
        if (target === getType(config.type)) {
            return config;
        }
    }

    return null;
}

function getType(type) {
    if (typeof type === 'string') {
        type = name2assettype[type] || type;
        type = cc.js.getClassByName(type);
    }
    return type;
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
module.exports = {
    addAssetsConfig: function (config) {
        assetsConfigList.push(config);
    },

    removeAssetsConfig: function (name) {
        if (typeof name === 'object')
            name = name.name;

        for (let i = 0; i < assetsConfigList.length; i++) {
            if (assetsConfigList[i].name === name) {
                return assetsConfigList.splice(i, 1);
            }
        }
    },

    clearAssetsConfig: function () {
        assetsConfigList = [];
    },

    get: function (id, type) {
        const config = getConfig(id, type);
        if (!config) return null;
        else return getResByUuid(config.uuid);
    },

    load: function (id, type) {
        const config = getConfig(id, type);
        if (!config) return Promise.reject(`${id} ${type} don't exist`);
        else return loadResByUuid(config.uuid);
    },
};
