

const Game = require('Game');
const Utils = require('Utils')

cc.Class({
    extends: cc.Component,

    properties: {
        body: cc.Sprite,
        feet: cc.Sprite,
        shadow: cc.Sprite,
    },

    init (gid, atlas) {
        let index, prefix;
        if (Game.config.isBoss(gid)) {
            index = Game.config.getBossIndex(gid);
            prefix = 'MB';
        } else {
            index = Game.config.getMonsterIndex(gid);
            prefix = 'M';
        }

        const feetName = `${prefix}_${Utils.fixedNumber(index, 2)}`;
        this.feet.spriteFrame = atlas.getSpriteFrame(feetName);

        const bodyName = `${feetName}_00`;
        if (Game.animation.hasClipConfig(bodyName)) {
            const bodyClip = Game.animation.getClip(bodyName, cc.WrapMode.Loop);
            const animation = this.body.addComponent(cc.Animation);
            animation.addClip(bodyClip);
            animation.play(bodyClip.name);
        } else {
            this.body.spriteFrame = atlas.getSpriteFrame(bodyName);
            this.getComponent(cc.Animation).play();
        }
    },
});
