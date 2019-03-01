
function GameProfile() {
    this.reset();
}
var proto = GameProfile.prototype;

proto.reset = function () {
    this.wasShowOpening = false;
};

proto.toJsonString = function () {
    return JSON.stringify(this);
};

proto.loadJsonString = function (str) {
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

var js = cc.js;

js.get(proto, 'isNew', function () {
    return !this.wasShowOpening;
});

module.exports = new GameProfile();