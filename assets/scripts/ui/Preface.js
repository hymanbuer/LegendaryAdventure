
cc.Class({
    extends: cc.Component,

    properties: {
        title: cc.Sprite,
        icon: cc.Sprite,
        text: cc.Label,
        container: cc.Node,
    },

    start () {
        this.scheduleOnce(this.fadeOut, 5);
        this.node.on('touchstart', this.fadeOut, this);
    },

    fadeOut () {
        if (this._isFadingOut) {
            return;
        }
        this._isFadingOut = true;
        this.container.runAction(cc.fadeOut(0.5));
        this.node.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.fadeOut(0.5),
            cc.removeSelf())
        );
    },
});
