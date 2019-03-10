
const profile = require('GameProfile');
const Main = require('Main');

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
            this._gotoGameScene();
        } else {
            this.story.spriteFrame = this.storySpriteFrames[this.currentIndex];
        }
    },

    _gotoGameScene () {
        profile.wasShowOpening = true;
        profile.save();
        Main.instance.transition('game', 0.5, 0);
    },
});
