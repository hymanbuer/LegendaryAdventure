
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        text: cc.Label,
        icon: cc.Sprite,
    },

    run (gid, message) {
        this.setItem(gid, message);
    },

    setItem (gid, message) {
        const data = Game.data.getMonster(gid);
        this.text.string = message || data.MESSAGE;
        this.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);
    },

    onClickConfirm () {
        this.node.destroy();
    },
});
