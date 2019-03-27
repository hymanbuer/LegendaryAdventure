
const Game = require('Game');

const SPACE_Y = 0;
const ORIGIN_BOTTOM = 16;

const Panel = cc.Class({
    extends: cc.Component,

    statics: {
        showingList: [],
    },

    properties: {
        text: cc.Label,
        icon: cc.Sprite,
    },

    onLoad () {
        Panel.showingList.push(this);
        this._updateLayout();
        this.scheduleOnce(()=> {
            this.node.destroy();
        }, 2.0);
    },

    onDestroy () {
        Panel.showingList.shift();
        this._updateLayout();
    },

    run (gid) {
        this.setItem(gid);
    },

    setItem (gid) {
        const data = Game.data.getMonster(gid);
        this.text.string = data.MESSAGE;
        this.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);
    },

    _updateLayout () {
        const height = this.node.height;
        Panel.showingList.forEach((item, i) => {
            const widget = item.getComponent(cc.Widget);
            widget.bottom = ORIGIN_BOTTOM + i*(height+SPACE_Y);
        });
    },
});
