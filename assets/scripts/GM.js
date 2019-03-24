
const SceneGame = require('SceneGame');
const Game = require('Game');
const profile = require('GameProfile');

cc.Class({
    extends: cc.Component,

    properties: {
        sceneGame: SceneGame,
    },

    onLoad () {
        if (CC_DEBUG) {
            window.GM = this.cmd.bind(this);
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }
    },

    onKeyDown (event) {
        switch (event.keyCode) {
            case cc.macro.KEY.pageup:
                this['up-floor']();
                break;
            case cc.macro.KEY.pagedown:
                this['down-floor']();
                break;
        };
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

    'up-floor' () {
        const lastFloor = profile.lastFloor;
        if (lastFloor.id >= Game.config.maxFloors) {
            return;
        }
        this.sceneGame.onChangeFloor({
            floorId: lastFloor.id + 1,
            isUp: true,
        });
    },

    'down-floor' () {
        const lastFloor = profile.lastFloor;
        if (lastFloor.id <= 0) {
            return;
        }
        this.sceneGame.onChangeFloor({
            floorId: lastFloor.id - 1,
            isUp: true,
        });
    },
});
