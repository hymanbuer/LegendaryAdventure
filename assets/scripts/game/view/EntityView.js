
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        sprite: cc.Sprite,
        shadow: cc.Node,
    },

    init (gid) {

        if (!(clipsConfig instanceof Array))
            clipsConfig = [clipsConfig];

        if (clipsConfig.length === 1 && clipsConfig[0].spriteFrames.length === 1) {
            this.sprite.spriteFrame = clipsConfig[0].spriteFrames[0];
        } else {
            for (const config of clipsConfig) {
                const spriteFrames = config.spriteFrames;
                const clip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, 4);
                clip.name = config.name;
                clip.wrapMode = config.wrapMode || cc.WrapMode.Loop;
                this.animation.addClip(clip);
                if (config.name === 'default') {
                    this.animation.play('default');
                }
            }
        }
    },

    play (name) {
        return this.animation.play(name);
    }
});
