
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
        this.btnStart.active = profile.isNew;
        this.btnContinue.active = !profile.isNew;
        this.btnRestart.active = !profile.isNew;
    },

    start () {
        
    },

    onClickStartGame () {
        cc.director.loadScene('opening');
    },

    onClickReplayGame () {
        profile.reset();
        cc.director.loadScene('opening');
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
    }
});
