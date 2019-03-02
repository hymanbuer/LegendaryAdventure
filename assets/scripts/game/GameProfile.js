
const localStorage = require('LocalStorage');

function GameProfile() {
    this.reset();
}
var proto = GameProfile.prototype;

proto.load = function () {
    Object.assign(this, localStorage.getItem('GameProfile', {}));
};

proto.save = function () {
    localStorage.setItem('GameProfile', this);
};

proto.reset = function () {
    this.wasShowOpening = false;
};

module.exports = new GameProfile();