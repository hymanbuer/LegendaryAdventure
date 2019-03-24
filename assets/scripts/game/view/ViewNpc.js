

const Game = require('Game');
const Utils = require('Utils')

cc.Class({
    extends: require('BaseView'),

    properties: {
        body: cc.Sprite,
        shadow: cc.Sprite,
    },

    init (gid) {
        const id = Utils.fixedNumber(gid, 2);
        const clipName = `PR_${id}_1`;
        const isPrincess = Game.config.isPrincess(gid);
        if (isPrincess && Game.animation.hasClipConfig(clipName)) {
            const bodyClip = Game.animation.getClip(clipName, cc.WrapMode.Loop);
            const animation = this.body.addComponent(cc.Animation);
            animation.addClip(bodyClip);
            animation.play(bodyClip.name);
        } else {
            const bodyName = isPrincess ? `P_${id}_1` : `P_${id}`;
            this.body.spriteFrame = Game.res.getItemSpriteFrame(bodyName);
            this.getComponent(cc.Animation).play();
        }
    },
});
