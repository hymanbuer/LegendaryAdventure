
const setting = require('GameSetting');
const profile = require('GameProfile');

cc.Class({
    extends: cc.Component,

    properties: {
        uiAboutPrefab: cc.Prefab,
        btnStart: cc.Node,
        btnContinue: cc.Node,
        btnRestart: cc.Node,
    },

    onLoad () {
        this.btnStart.active = !profile.wasShowOpening;
        this.btnContinue.active = profile.wasShowOpening;
        this.btnRestart.active = profile.wasShowOpening;
    },

    start () {
        cc.director.preloadScene('game');
    },

    onClickStartGame () {
        this._loadSceneAfterPlaySound(this.btnStart);
    },

    onClickReplayGame () {
        profile.reset();
        this._loadSceneAfterPlaySound(this.btnRestart);
    },

    onClickContinueGame () {
        cc.director.loadScene('game');
    },

    onClickAbout () {
        const node = cc.instantiate(this.uiAboutPrefab);
        this.node.addChild(node);
    },

    onClickExit () {
        cc.game.end();
    },

    _loadSceneAfterPlaySound (node) {
        const source = node.getComponent(cc.AudioSource);
        cc.director.preloadScene('opening');
        if (source) {
            this.scheduleOnce(() => {
                cc.director.loadScene('opening');
            }, source.getDuration());
        } else {
            cc.director.loadScene('opening');
        }
    },
});
