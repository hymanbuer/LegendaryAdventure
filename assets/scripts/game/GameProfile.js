
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
    this.lastFloor = {id: 0};
};

module.exports = new GameProfile();