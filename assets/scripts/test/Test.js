
const loader = require('CCLoaderHelper');
const animations = require('AnimationManager');

cc.Class({
    extends: cc.Component,

    properties: {
        animationsConfig: {
            default: null,
            type: cc.JsonAsset,
        },

        animation: cc.Animation,

        
    },

    start () {
        animations.update(this.animationsConfig.json);

        const clipName = 'walk_l';
        animations.loadClip(clipName, cc.WrapMode.Loop)
            .then(clip => {
                this.animation.addClip(clip);
                this.animation.play(clipName);
            });
    },
});
