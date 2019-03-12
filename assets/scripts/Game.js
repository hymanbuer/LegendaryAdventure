
const PanelManager = require('PanelManager');

const DataCenter = require('DataCenter');
const Bag = require('Bag');
const MapState = require('MapState');
const TaskState = require('TaskState');
const Resources = require('Resources');

const Game = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        
    },

    onLoad () {
        Game.instance = this;
        this._init();
    },

    onDestroy () {
        Game.instance = null;
    },

    start () {

    },

    _init () {
        this._bag = new Bag();
        this._mapState = new MapState();
        this._taskState = new TaskState();
    },
});

/////// base

cc.js.get(Game, 'panel', function () {
    return PanelManager.instance;
});
Game.openPanel = function (...args) {
    return PanelManager.instance.openPanel(...args);
};
Game.onPanelClosed = function (...args) {
    return PanelManager.instance.onPanelClosed(...args);
};

/////// game

cc.js.get(Game, 'dataCenter', function () {
    return Game.instance.getComponent(DataCenter);
});
cc.js.get(Game, 'bag', function () {
    return Game.instance._bag;
});
cc.js.get(Game, 'mapState', function () {
    return Game.instance._mapState;
});
cc.js.get(Game, 'taskState', function () {
    return Game.instance._taskState;
});
cc.js.get(Game, 'res', function () {
    return Game.instance.getComponent(Resources);
});

////// common
/**
 * sceneId和floorId均从0开始计数
 */

cc.js.get(Game, 'maxSceneId', function () {
    return 10;
});

Game.getSceneId = function (floorId) {
    let sceneId = Math.floor(floorId / 10);
    if (floorId % 10 !== 0) {
        sceneId += 1;
    }
    cc.assert(sceneId <= 10, `floorId exceeds maxSceneId: ${sceneId}`);
    return sceneId;
};