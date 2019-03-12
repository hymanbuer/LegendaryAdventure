
const Game = require('Game');

const PanelGetItem = cc.Class({
    extends: cc.Component,

    properties: {
        text: cc.Label,
        icon: cc.Sprite,
    },

    run (gid, message) {
        this.setItem(gid, message);
    },

    setItem (gid, message) {
        const data = Game.dataCenter.getMonster(gid);
        this.text.string = message || data.MESSAGE;
        this.icon.spriteFrame = Game.res.getSpriteFrame(gid);
    },

    onClickConfirm () {
        this.node.destroy();
    },
});
