
const Game = require('Game');

const spaceY = 2;

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
        const widget = this.getComponent(cc.Widget);
        const count = PanelGetItem.showingCount;
        widget.bottom += count * this.node.height + (count-1) * spaceY;

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
        this.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);
    },
});
