
const setting = require('GameSetting');
const profile = require('GameProfile');

const Main = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        mask: cc.Node,
    },

    onLoad () {
        cc.game.addPersistRootNode(this.node);
        Main.instance = this;
        this._init();
    },

    onDestroy () {
        Main.instance = null;
        cc.game.removePersistRootNode(this.node);
    },

    transition (nextSceneName) {
        cc.director.preloadScene(nextSceneName);
        this.mask.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(() => {
                cc.director.loadScene(nextSceneName, () => {
                    this.mask.runAction(cc.fadeOut(0.5));
                });
            }),
        ));
    },

    _init () {
        setting.load();
        profile.load();
    },
});
