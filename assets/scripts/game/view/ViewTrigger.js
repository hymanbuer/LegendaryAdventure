

const Game = require('Game');

cc.Class({
    extends: require('BaseView'),

    properties: {
        body: cc.Sprite,
    },

    onLoad () {
        this.node.on('trigger-enter', this.onEnter, this);
        this.node.on('trigger-exit', this.onExit, this);
    },

    init (gid) {
        this.body.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);

        const clips = Game.res.getTriggerClips(gid);
        const animation = this.body.addComponent(cc.Animation);
        animation.addClip(clips.enter);
        animation.addClip(clips.exit);
        this._clips = clips;
        this._animation = animation;
    },

    onEnter () {
        this._animation.play(this._clips.enter.name);
    },

    onExit () {
        this._animation.play(this._clips.exit.name);
    },
});
