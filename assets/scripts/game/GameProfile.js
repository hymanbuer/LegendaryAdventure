
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
    this.maxFloorId = 0;

    this.player = {
        level: 1,
        hp: 200,
        maxHp: 200,
        attack: 15,
        defence: 10,
        exp: 0,
        nextExp: 9,
    };
    this.player.sword = undefined;
    this.player.shield = undefined;

    this.bag = {};
    this.bag.coins = 0;
    this.bag.items = [
        {gid: 2001, num: 1},
        {gid: 2002, num: 3},
    ];

    this.mapState = [];
    this.taskState = [];
    this.savedPrincess = {
        [9]: true,
    };

    this.shop = {};
};

module.exports = new GameProfile();