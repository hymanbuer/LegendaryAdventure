

const Game = require('Game');

cc.Class({
    extends: require('BaseView'),

    properties: {
        icon: cc.Sprite,
    },

    init (gid) {
        this.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);
        const node = this.icon.node;
        if (node.width > 80) {
            const scale = 80 / node.width;
            node.anchorX = 0.5;
            node.anchorY = 0.2;
            node.setScale(scale);
        }
    },

    onDestroy () {
        if (Game.config.isBoxItem()) {
            Game.audio.playEffect('open-box');
        }
    },
});
