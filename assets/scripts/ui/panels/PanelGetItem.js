
const Game = require('Game');

const startY = -406;
const spaceY = 88;

const PanelGetItem = cc.Class({
    extends: cc.Component,

    statics: {
        showingCount: 0,
    },

    properties: {
        text: cc.Label,
        icon: cc.Sprite,
    },

    onLoad () {
        PanelGetItem.showingCount += 1;
        this.node.y = startY + (PanelGetItem.showingCount - 1)*spaceY;
        this.scheduleOnce(()=> {
            this.node.destroy();
        }, 2.0);
    },

    onDestroy () {
        PanelGetItem.showingCount -= 1;
    },

    run (gid) {
        this.setItem(gid);
    },

    setItem (gid) {
        const data = Game.dataCenter.getMonster(gid);
        this.text.string = data.MESSAGE;
        this.icon.spriteFrame = Game.res.getSpriteFrame(gid);
    },
});
