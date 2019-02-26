
const DataCenter = require('DataCenter');
const Resources = require('Resources');

const startY = -406;
const spaceY = 88;

const UiGetItem = cc.Class({
    extends: cc.Component,

    statics: {
        showingCount: 0,
    },

    properties: {
        text: cc.Label,
        icon: cc.Sprite,
    },

    onLoad () {
        UiGetItem.showingCount += 1;
        this.node.y = startY + (UiGetItem.showingCount - 1)*spaceY;
        this.scheduleOnce(()=> {
            this.node.destroy();
        }, 2.0);
    },

    onDestroy () {
        UiGetItem.showingCount -= 1;
    },

    setItem (gid) {
        const data = DataCenter.instance.getMonster(gid);
        this.text.string = data.MESSAGE;
        this.icon.spriteFrame = Resources.instance.getSpriteFrame(gid);
    },
});
