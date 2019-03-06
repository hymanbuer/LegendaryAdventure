
const loader = require('CCLoaderHelper');

function createClip(atlas, config, clipName, wrapMode) {
    const frames = config.frames.map(name => atlas.getSpriteFrame(name));
    const sample = 1.0 / config.delay;
    const clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
    clip.name = clipName;
    clip.wrapMode = wrapMode || config.wrapMode || cc.WrapMode.Normal;
    return clip;
}

class AnimationManager {
    constructor () {
        this._animationsConfig = {};
    }

    update (...configs) {
        Object.assign(this._animationsConfig, ...configs);
    }

    hasClipConfig (clipName) {
        return !!this._animationsConfig[clipName];
    }

    getClip (clipName, wrapMode) {
        const config = this._animationsConfig[clipName];
        const atlas = loader.getResByUuid(config.uuid);
        return createClip(atlas, config, clipName, wrapMode);
    }

    loadClip (clipName, wrapMode) {
        const config = this._animationsConfig[clipName];
        return loader.loadResByUuid(config.uuid).then(
            atlas => createClip(atlas, config, clipName, wrapMode));
    }
}

module.exports = new AnimationManager();
