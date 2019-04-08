
const profile = require('GameProfile');
const Main = require('Main');
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
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
    },
});
