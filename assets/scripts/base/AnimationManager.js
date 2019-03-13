
const loader = require('CCLoaderHelper');

function createClip(atlas, config, clipName, wrapMode) {
    const frames = config.frames.map(name => atlas.getSpriteFrame(name));
    const sample = 1.0 / config.delay;
    const clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
    clip.name = clipName;
    clip.wrapMode = wrapMode || config.wrapMode || cc.WrapMode.Normal;
    return clip;
}

const AnimationManager = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        animationsConfig: cc.JsonAsset,
    },

    onLoad () {
        AnimationManager.instance = this;
        this._animationsConfig = this.animationsConfig.json;
    },

    onDestroy () {
        AnimationManager.instance = undefined;
    },

    update (...configs) {
        Object.assign(this._animationsConfig, ...configs);
    },

    hasClipConfig (clipName) {
        return !!this._animationsConfig[clipName];
    },

    getClip (clipName, wrapMode) {
        const config = this._animationsConfig[clipName];
        const atlas = loader.getResByUuid(config.uuid);
        return createClip(atlas, config, clipName, wrapMode);
    },

    loadClip (clipName, wrapMode) {
        const config = this._animationsConfig[clipName];
        return loader.loadResByUuid(config.uuid)
            .then(atlas => createClip(atlas, config, clipName, wrapMode));
    },

    getClips (clipNames, wrapMode) {
        const isArray = wrapMode instanceof Array;
        return clipNames.map((name, i) => {
            const mode = isArray ? wrapMode[i] : wrapMode;
            return this.getClip(name, mode);
        });
    },

    loadClips (clipNames, wrapMode) {
        const isArray = wrapMode instanceof Array;
        const uuids = clipNames.map(name => this._animationsConfig[name].uuid);
        return loader.loadResArrayByUuid(uuids)
            .then(assets => clipNames.map((name, i) => {
                const mode = isArray ? wrapMode[i] : wrapMode;
                const config = this._animationsConfig[name];
                return createClip(assets[i], config, name, mode);
            }));
    },
});
