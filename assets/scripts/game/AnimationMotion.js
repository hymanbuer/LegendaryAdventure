
const MotionState = cc.Enum({
    Stand: 0,
    Walk: 1,
});

cc.Class({
    extends: cc.Component,

    statics: {
        MotionState: MotionState,
    },

    properties: {
        target: cc.Node,
    },

    onLoad () {
        this.target = this.target || this.node;
        if (!this.target.getComponent(cc.Animation)) {
            this.target.addComponent(cc.Animation);
        }
        this.node.on('character-stand', this.stand, this);
        this.node.on('character-walk', this.walk, this);
        this.node.on('character-rotate', this.rotate, this);
    },

    addStandClip (direction, clip) {
        const animation = this._getAnimation();
        clip.name = this._getStandName(direction);
        animation.addClip(clip);
    },

    addWalkClip (direction, clip) {
        const animation = this._getAnimation();
        clip.name = this._getWalkName(direction);
        animation.addClip(clip);
    },

    stand (direction) {
        if (direction != undefined) {
            this._direction = direction;
        }
        const name = this._getStandName(this._direction);
        this._motionState = MotionState.Stand;
        if (this._getCurrentClipName() !== name) {
            this._playClip(name);
        }
    },

    walk (direction) {
        if (direction != undefined) {
            this._direction = direction;
        }
        const name = this._getWalkName(this._direction);
        this._motionState = MotionState.Walk;
        if (this._getCurrentClipName() !== name) {
            this._playClip(name);
        }
    },

    rotate (direction) {
        if (this._motionState === MotionState.Stand) {
            this.stand(direction);
        } else if (this._motionState === MotionState.Walk) {
            this.walk(direction);
        }
    },

    _playClip (name) {
        const animation = this._getAnimation();
        animation.play(name);
    },

    _getCurrentClipName () {
        const animation = this._getAnimation();
        return animation.currentClip ? animation.currentClip.name : null;
    },

    _getStandClip (direction) {
        const name = this._getStandName(direction);
        return this._getClip(name);
    },

    _getWalkClip (direction) {
        const name = this._getWalkName(direction);
        return this._getClip(name);
    },

    _getClip (name) {
        const animation = this._getAnimation();
        for (let clip of animation.getClips()) {
            if (clip.name === name) {
                return clip;
            }
        }
        return null;
    },

    _getAnimation () {
        let animation = this.target.getComponent(cc.Animation);
        if (animation == null) {
            animation = this.target.addComponent(cc.Animation);
        }
        return animation;
    },

    _getStandName (direction) {
        return `stand-${direction}`;
    },

    _getWalkName (direction) {
        return `walk-${direction}`;
    },
});
