
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
        count: cc.Label,
    },

    start () {
        this.getComponent(cc.Toggle).uncheck();
    },

    init (gid, num) {
        this.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);
        this.count.string = num.toString();
        this.count.node.active = !Game.config.isInfiniteItem(gid);
        this.gid = gid;
    },

    updateCount (num) {
        this.count.string = num.toString();
    },
});
