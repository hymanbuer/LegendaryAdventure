

const Game = require('Game');

cc.Class({
    extends: require('BaseView'),

    properties: {
        icon: cc.Sprite,
    },

    init (gid) {
        this.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);
    },
});
