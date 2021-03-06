
const SceneGame = require('SceneGame');
const Game = require('Game');
const profile = require('GameProfile');

/**
 * Usage:
 *   In Chrome Console input:
 *   > GM('goto-floor', 3)
 *   > GM('plus-coins', 1000)
 *   ...
 */
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
            case cc.macro.KEY.up:
            case cc.macro.KEY.right:
                this['up-floor']();
                break;
            case cc.macro.KEY.pagedown:
            case cc.macro.KEY.down:
            case cc.macro.KEY.left:
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
            isUp: false,
        });
    },

    'plus-coins' (num) {
        Game.bag.plusCoins(num);
    },
});
