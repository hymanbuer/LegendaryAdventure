
const profile = require('GameProfile');

cc.Class({
    extends: cc.Component,

    properties: {
        story: cc.Sprite,
        storySpriteFrames: [cc.SpriteFrame],
    },

    start () {
        this.story.spriteFrame = this.storySpriteFrames[0];
        this.currentIndex = 0;
    },

    onClick () {
        if (this.currentIndex >= this.storySpriteFrames.length) return;

        this.currentIndex += 1;
        if (this.currentIndex >= this.storySpriteFrames.length) {
            this.scheduleOnce(this.gotoGameScene, 0.5);
        } else {
            this.story.spriteFrame = this.storySpriteFrames[this.currentIndex];
        }
    },

    gotoGameScene () {
        profile.wasShowOpening = true;
        profile.save();
        this.story.node.runAction(cc.sequence(cc.fadeOut(0.5), cc.callFunc(()=> {
            cc.director.loadScene('game');
        })));
    },
});
