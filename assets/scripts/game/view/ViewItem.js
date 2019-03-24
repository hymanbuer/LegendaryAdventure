

const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
    },

    init (gid) {
        this.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);
    },
});
