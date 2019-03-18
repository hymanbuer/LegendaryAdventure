
const SceneGame = require('SceneGame');

cc.Class({
    extends: cc.Component,

    properties: {
        sceneGame: SceneGame,
    },

    onLoad () {
        if (CC_DEBUG) {
            window.GM = this.cmd.bind(this);
        }
    },

    cmd (name, ...args) {
        if (typeof this[name] == 'function') {
            this[name].call(this, ...args);
        }
    },

    'goto-floor' (floorId) {
        this.sceneGame.onChangeFloor({
            floorId: floorId,
            isUp: true,
        });
    },
});
