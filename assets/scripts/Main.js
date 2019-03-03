
const setting = require('GameSetting');
const profile = require('GameProfile');
const AudioManager = require('AudioManager');

const Main = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        mask: cc.Node,
    },

    onLoad () {
        Main.instance = this;
        this._init();
        this._addPersistRootNodes();
    },

    onDestroy () {
        Main.instance = null;
        cc.game.removePersistRootNode(this.node);
    },

    start () {
        AudioManager.instance.muteAudio = !setting.isAudioOn;
    },

    transition (nextSceneName, inTime, outTime) {
        cc.director.preloadScene(nextSceneName);
        this.mask.zIndex = cc.macro.MAX_ZINDEX;
        this.mask.runAction(cc.sequence(
            cc.fadeIn(inTime || 0.5),
            cc.callFunc(() => {
                cc.director.loadScene(nextSceneName, () => {
                    this.mask.runAction(cc.fadeOut(outTime || 0.5));
                });
            }),
        ));
    },

    _init () {
        setting.load();
        profile.load();
    },

    _addPersistRootNodes () {
        cc.game.addPersistRootNode(this.node);
        cc.game.addPersistRootNode(this.mask);
    },
});
