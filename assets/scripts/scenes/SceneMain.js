
const profile = require('GameProfile');
const Main = require('Main');
const Game = require('Game');
const version = require('version');

cc.Class({
    extends: cc.Component,

    properties: {
        btnStart: cc.Node,
        btnContinue: cc.Node,
        btnRestart: cc.Node,
        loadingTips: cc.Node,
        version: cc.Label,
    },

    onLoad () {
        this.btnStart.active = !profile.wasShowOpening;
        this.btnContinue.active = profile.wasShowOpening;
        this.btnRestart.active = profile.wasShowOpening;

        this.version.string = `v${version.resVersion}`;
    },

    start () {
        // cc.director.preloadScene('game');
    },

    onClickStartGame () {
        this._loadSceneAfterPlaySound(this.btnStart);
    },

    onClickReplayGame () {
        profile.reset();
        this._loadSceneAfterPlaySound(this.btnRestart);
    },

    onClickContinueGame () {
        Main.instance.transition('game', 0.5, 0);
        this._showLoadingTips();
    },

    onClickAbout () {
        Game.openPanel('credits');
    },

    onClickExit () {
        cc.game.end();
    },

    _loadSceneAfterPlaySound (node) {
        const source = node.getComponent(cc.AudioSource);
        if (source) {
            source.play();
            Main.instance.transition('opening', source.getDuration());
        } else {
            Main.instance.transition('opening');
        }
        this._showLoadingTips();
    },

    _showLoadingTips () {
        this.loadingTips.active = true;
        this.btnStart.active = false;
        this.btnContinue.active = false;
        this.btnRestart.active = false;
    },
});
