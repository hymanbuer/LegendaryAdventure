
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
        const clipName = 'walk_l';
        animations.instance.getClip(clipName, cc.WrapMode.Loop).then(clip => {
            this.animation.addClip(clip);
            this.animation.play(clipName);
        });
    },
});
