

const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        body: cc.Sprite,
    },

    onLoad () {
        this.node.on('open', this.onOpen, this);
    },

    init (gid) {
        this.body.spriteFrame = Game.res.getItemSpriteFrameByGid(gid);

        const bodyClip = Game.res.getClipByGid(gid);
        if (bodyClip) {
            const animation = this.body.addComponent(cc.Animation);
            animation.addClip(bodyClip);
            this._bodyClip = bodyClip;
        }
    },

    onOpen (callback) {
        callback = callback || Game.EMPTY_FUNC;
        if (this._bodyClip == null) {
            this.node.destroy();
            callback(null);
        } else {
            const animation = this.body.getComponent(cc.Animation);
            const state = animation.play(this._bodyClip.name);
            state.on('finished', ()=> {
                this.node.destroy();
                callback(null);
            });
        }
    },
});
