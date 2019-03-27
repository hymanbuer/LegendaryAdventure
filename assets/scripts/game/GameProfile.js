
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
    this.player = {
        level: 1,
        hp: 200,
        maxHp: 200,
        attack: 15,
        defence: 10,
        exp: 0,
        nextExp: 9,
    };

    this.coins = 0;
    this.items = [
        {gid: 2001, num: 1},
        {gid: 2002, num: 3},

        {gid: 151, num: 10},
        {gid: 152, num: 10},

        {gid: 155, num: 5},
        {gid: 156, num: 5},
        {gid: 157, num: 5},
    ];
};

module.exports = new GameProfile();