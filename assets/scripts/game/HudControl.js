
const Game = require('Game');

function fixedNumber(value, n) {
    const digits = [];
    while (n > 0) {
        digits.push(value % 10);
        value = Math.floor(value / 10);
        n -= 1;
    }
    digits.reverse();
    return digits.join('');
}

cc.Class({
    extends: cc.Component,

    properties: {
        atlas: cc.SpriteAtlas,

        siteName: cc.Sprite,
        siteFloor: cc.Label,

        numYellowKeys: cc.Label,
        numBlueKeys: cc.Label,
        numRedKeys: cc.Label,

        top: cc.Node,
        bottom: cc.Node,
    },

    start () {

    },

    changeSite (floorId) {
        let id = 0;
        if (floorId > 0) {
            id = Math.floor(floorId / 10) + 1;
        }
        const name = 'text_zonename' + (id + 1);
        this.siteName.spriteFrame = this.atlas.getSpriteFrame(name);
        this.siteFloor.string = ':' + fixedNumber(floorId, 2);
    },

    updateNumKeys () {
        this.numYellowKeys.string = Game.bag.getNumOfItem(155);
        this.numBlueKeys.string = Game.bag.getNumOfItem(156);
        this.numRedKeys.string = Game.bag.getNumOfItem(157);
    },
});
