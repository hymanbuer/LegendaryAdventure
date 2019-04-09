
const PanelManager = require('PanelManager');
const AnimationManager = require('AnimationManager');

const GameProfile = require('GameProfile');
const GameConfig = require('GameConfig');
const Bag = require('Bag');
const MapState = require('MapState');
const TaskState = require('TaskState');
const PlayerStatus = require('PlayerStatus');

const Game = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        isMonsterRespawn: true,
    },

    onLoad () {
        Game.instance = this;
        this._init();
    },

    onDestroy () {
        Game.instance = null;
    },

    onEnable () {
        // this._beforeUnloadListener = () => {
        //     this.saveProfile();
        // };
        // window.addEventListener('beforeunload', this._beforeUnloadListener);
        // window.addEventListener('unload', this._beforeUnloadListener);
    },

    onDisable () {
        // window.removeEventListener('beforeunload', this._beforeUnloadListener);
        // window.removeEventListener('unload', this._beforeUnloadListener);
        this.unschedule(this.saveProfile);
    },

    start () {
        this.schedule(this.saveProfile, 5)
    },

    _init () {
        this._bag = new Bag();
        this._mapState = new MapState();
        this._taskState = new TaskState();
        this._playerStatus = new PlayerStatus();
        this._loadProfile();

        this._initListeners();
    },

    _loadProfile () {
        this._bag.load(GameProfile.bag);
        this._mapState.load(GameProfile.mapState)
        this._taskState.load(GameProfile.taskState);
        this._playerStatus.load(GameProfile.player);
    },

    saveProfile () {
        GameProfile.bag = this._bag.dump();
        GameProfile.mapState = this._mapState.dump()
        GameProfile.taskState = this._taskState.dump();
        GameProfile.player = this._playerStatus.dump();
        GameProfile.save();
    },

    saveBag () {
        GameProfile.bag = this._bag.dump();
        GameProfile.save();
    },

    saveMapState () {
        GameProfile.mapState = this._mapState.dump();
        GameProfile.save();
    },

    saveTaskState () {
        GameProfile.taskState = this._taskState.dump();
        GameProfile.save();
    },

    savePlayerStatus () {
        GameProfile.player = this._playerStatus.dump();
        GameProfile.save();
    },

    _initListeners () {
        this._bag.on('add-item', this._taskState.onGetItem, this._taskState);
        this._bag.on('add-item', this.onCheckGetSwordOrStones, this);
        this._bag.on('add-item', this.onCheckGetShieldOrStones, this);
        this._bag.on('add-item', this.onCheckInstantUseItem, this);

        // this._bag.on('add-item', this.saveBag, this);
        // this._bag.on('remove-item', this.saveBag, this);
        // this._bag.on('coins-changed', this.saveBag, this);

        // this._taskState.on('task-state-changed', this.saveTaskState, this);
    },

    onCheckInstantUseItem (gid) {
        if (GameConfig.isInstantUseItem(gid)) {
            this._bag.reduceItem(gid);
            const info = Game.data.getItemInfo(gid);
            if (info.ATT) {
                this._playerStatus.attack += info.ATT;
            } else if (info.DEF) {
                this._playerStatus.defence += info.DEF;
            }
        }
    },

    onCheckGetSwordOrStones (gid) {
        if (GameConfig.isSwordItem(gid)) {
            this._playerStatus.changeSword(this._createNewSword(gid));
        } else if (GameConfig.isSwordStoneItem(gid)) {
            this._playerStatus.addSwordStone(gid);
        }
    },

    onCheckGetShieldOrStones (gid) {
        if (GameConfig.isShieldItem(gid)) {
            this._playerStatus.changeShield(this._createNewShield(gid));
        } else if (GameConfig.isShieldStoneItem(gid)) {
            this._playerStatus.addShieldStone(gid);
        }
    },

    _createNewSword (gid) {
        const sword = {};
        const info = Game.data.getItemInfo(gid);
        sword.gid = gid;
        sword.base = info.ATT;
        sword.stones = [];
        sword.enhance = this._createCommonEnhance(gid);
        return sword;
    },

    _createNewShield (gid) {
        const shield = {};
        const info = Game.data.getItemInfo(gid);
        shield.gid = gid;
        shield.base = info.DEF;
        shield.stones = [];
        shield.enhance = this._createCommonEnhance(gid);
        return shield;
    },

    _createCommonEnhance (gid) {
        const level = GameConfig.getEquipmentLevel(gid);
        const info = Game.data.getEnhanceInfo(level);
        return {
            level: 0,
            limit: info.LIMIT,
            cost: info.GOLDCOST,
            costStep: info.COSTADD,
            step: info.ADD,
        };
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
Game.closeAllPanel = function (...args) {
    return PanelManager.instance.closeAllPanel(...args);
};

cc.js.get(Game, 'animation', function () {
    return AnimationManager.instance;
});


/////// game

cc.js.get(Game, 'data', function () {
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
cc.js.get(Game, 'player', function () {
    return Game.instance._playerStatus;
});
cc.js.get(Game, 'res', function () {
    return Game.instance.getComponent('GameRes');
});
cc.js.get(Game, 'config', function () {
    return GameConfig;
});

cc.js.get(Game, 'profile', function () {
    return GameProfile;
});

////// common

