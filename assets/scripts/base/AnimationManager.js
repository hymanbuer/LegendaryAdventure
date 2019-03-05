
const loader = require('CCLoaderHelper');

const AnimationManager = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        animationsConfig: {
            default: null,
            type: cc.JsonAsset,
        },
    },

    onLoad () {
        AnimationManager.instance = this;
    },

    getClip (clipName, wrapMode) {
        const data = this.animationsConfig.json;
        const config = data[clipName];
        return loader.loadResByUuid(config.uuid).then(atlas => {
            const frames = config.frames.map(name => atlas.getSpriteFrame(name));
            const sample = 1.0 / config.delay;
            const clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
            clip.name = clipName;
            clip.wrapMode = wrapMode;
            return clip;
        });
    },
});
