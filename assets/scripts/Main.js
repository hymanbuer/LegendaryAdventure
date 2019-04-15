
const setting = require('GameSetting');
const profile = require('GameProfile');
const AudioManager = require('AudioManager');
const Assets = require('Assets');

const Main = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        maskPrefab: cc.Prefab,
    },

    onLoad () {
        if (Main.instance) {
            return;
        }
        Main.instance = this;
        this._init();
        cc.game.addPersistRootNode(this.mask);
        cc.game.addPersistRootNode(this.node);
    },

    onDestroy () {
        if (Main.instance !== this) {
            return;
        }
        Main.instance = null;
        cc.game.removePersistRootNode(this.node);
        cc.game.removePersistRootNode(this.mask);
    },

    start () {
        if (Main.instance !== this) {
            return;
        }
        AudioManager.instance.muteAudio = !setting.isAudioOn;
    },

    transition (nextSceneName, inTime, outTime) {
        cc.director.preloadScene(nextSceneName);
        this.mask.active = true;
        this.mask.zIndex = cc.macro.MAX_ZINDEX;
        this.mask.opacity = 0;
        this.mask.runAction(cc.sequence(
            cc.fadeIn(inTime || 0.5),
            cc.callFunc(() => {
                cc.director.loadScene(nextSceneName, () => {
                    this.mask.runAction(cc.sequence(cc.fadeOut(outTime || 0.5), cc.callFunc(() => {
                        this.mask.active = false;
                    })));
                });
            }),
        ));
    },

    _init () {
        setting.load();
        profile.load();
        this._addMask();
    },

    _addMask () {
        this.mask = cc.instantiate(this.maskPrefab);
        this.mask.parent = this.node.parent;
        this.mask.active = false;
    },
});
