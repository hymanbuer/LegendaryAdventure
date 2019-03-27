
const profile = require('GameProfile');
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        stores: cc.Node,
    },

    start () {
        const lastFloor = profile.lastFloor;
        const maxOpenSceneId = Game.config.getSceneId(lastFloor.id);
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
        sceneGame.gotoFloor(floorId);
    },
});
