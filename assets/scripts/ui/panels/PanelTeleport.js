
const profile = require('GameProfile');
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        stores: cc.Node,
    },

    start () {
        const maxOpenSceneId = Game.config.getSceneId(profile.maxFloorId);
        this.stores.children.forEach((store, i) => {
            const isOpen = i <= maxOpenSceneId;
            store.getComponent(cc.Button).interactable = isOpen;
            store.on('click', this.onClickStore, this);
        });
    },

    onClickClose () {
        this.node.destroy();
    },

    onClickStore (event) {
        const sceneId = Number.parseInt(event.target.name);
        const floorId = Game.config.getFirstFloorOfScene(sceneId);
        const sceneGame = cc.director.getScene().getComponentInChildren('SceneGame');

        const sceneName = Game.config.getSceneName(sceneId);
        const tips = `确定前往${sceneName}吗?`;
        Game.openPanel('notice', tips, {
            hasCancel: true,
            confirmHandler: function () {
                sceneGame.gotoFloor(floorId);
            },
        });
    },
});
