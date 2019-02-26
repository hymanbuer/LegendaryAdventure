
const CCLoaderHelper = module.exports = {};

// if the res was already loaded then return directly,
// other then load by cc.loader.loadRes.
CCLoaderHelper.loadResByUrl = function (url, type) {
    return new Promise((resolve, reject) => {
        cc.loader.loadRes(url, type, (err, asset) => {
            if (err)
                reject(err);
            else
                resolve(asset);
        });
    });
}

CCLoaderHelper.loadResByUuid = function (uuid) {
    return new Promise((resolve, reject) => {
        cc.loader.load({ type: 'uuid', uuid: uuid }, null, (err, asset) => {
            if (err)
                reject(err);
            else
                resolve(asset);
        });
    });
}

