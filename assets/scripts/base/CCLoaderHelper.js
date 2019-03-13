
const exports = module.exports = {};

exports.loadResByUrl = function (url, type) {
    return new Promise((resolve, reject) => {
        cc.loader.loadRes(url, type, (err, asset) => {
            if (err)
                reject(err);
            else
                resolve(asset);
        });
    });
};

exports.loadResByUuid = function (uuid) {
    return new Promise((resolve, reject) => {
        cc.loader.load({ type: 'uuid', uuid: uuid }, null, (err, asset) => {
            if (err)
                reject(err);
            else
                resolve(asset);
        });
    });
};

exports.loadResArrayByUrl = function (urls, types) {
    return new Promise((resolve, reject) => {
        cc.loader.loadResArray(urls, types, (err, assets) => {
            if (err)
                reject(err);
            else
                resolve(assets);
        });
    });
};

exports.loadResArrayByUuid = function (uuids) {
    const resources = uuids.map(uuid => ({type: 'uuid', uuid: uuid}));
    return new Promise((resolve, reject) => {
        cc.loader.load(resources, (err, assets) => {
            if (err)
                reject(err);
            else
                resolve(assets);
        });
    });
};

exports.getResByUrl = function (url, type) {
    return cc.loader.getRes(url, type);
};

exports.getResByUuid = function (uuid) {
    const url = cc.AssetLibrary.getLibUrlNoExt(uuid) + '.json';
    return cc.loader.getRes(url);
};

exports.releaseRecursively = function (owner, excludeMap) {
    const deps = cc.loader.getDependsRecursively(owner);
    for (let key of deps) {
        if (excludeMap && excludeMap[key]) {
            continue;
        } else {
            cc.loader.release(key);
        }
    }
};