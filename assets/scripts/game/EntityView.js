

cc.Class({
    extends: cc.Component,

    properties: {
        sprite: cc.Sprite,
        animation: cc.Animation,
        shadow: cc.Node,
    },

    init (gid, clipsConfig, isShowShadow) {
        this.gid = gid;

        if (this.shadow)
            this.shadow.active = !!isShowShadow;
            
        if (!clipsConfig) {
            this.sprite.spriteFrame = null;
            return;
        };

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
