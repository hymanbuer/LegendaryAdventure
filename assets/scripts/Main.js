
const setting = require('GameSetting');
const profile = require('GameProfile');
const AudioManager = require('AudioManager');

const Main = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        maskPrefab: cc.Prefab,
    },

    onLoad () {
        Main.instance = this;
        this._init();
        this._addMask();
        cc.game.addPersistRootNode(this.node);
    },

    onDestroy () {
        Main.instance = null;
        cc.game.removePersistRootNode(this.node);
        cc.game.removePersistRootNode(this.mask);
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

    _addMask () {
        this.mask = cc.instantiate(this.maskPrefab);
        this.mask.parent = this.node.parent;
        cc.game.addPersistRootNode(this.mask);
    },
});
