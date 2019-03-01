
exports.isAudioOn = true;

exports.toJsonString = function () {
    return JSON.stringify(this);
};

exports.loadJsonString = function (str) {
    try {
        const o = JSON.parse(str);
        for (const key in o) {
            if (o.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = o[key];
            }
        }
    } catch (err) {
        cc.log('failed to load json string: ', str);
        cc.log(err);
    }
};