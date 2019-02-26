

cc.Class({
    extends: cc.Component,

    properties: {
        uiAboutPrefab: cc.Prefab,
    },

    start () {

    },

    onClickReplayGame () {
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
