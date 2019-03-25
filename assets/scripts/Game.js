
const PanelManager = require('PanelManager');
const AnimationManager = require('AnimationManager');

const GameConfig = require('GameConfig');
const Bag = require('Bag');
const MapState = require('MapState');
const TaskState = require('TaskState'); 

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

Game.EMPTY_FUNC = function () {};

cc.js.get(Game, 'panel', function () {
    return PanelManager.instance;
});
Game.openPanel = function (...args) {
    return PanelManager.instance.openPanel(...args);
};
Game.onPanelClosed = function (...args) {
    return PanelManager.instance.onPanelClosed(...args);
};

cc.js.get(Game, 'animation', function () {
    return AnimationManager.instance;
});


/////// game

cc.js.get(Game, 'dataCenter', function () {
    return Game.instance.getComponent('DataCenter');
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
    return Game.instance.getComponent('GameRes');
});
cc.js.get(Game, 'config', function () {
    return GameConfig;
});

////// common

