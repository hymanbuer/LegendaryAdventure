
const LoaderHelper = require('CCLoaderHelper');
const Game = require('Game');
const World = require('World');
const HudControl = require('HudControl');

const profile = require('GameProfile');

cc.Class({
    extends: cc.Component,

    properties: {
        hud: HudControl,
        world: World,
        mask: cc.Node,
        bg: cc.Node,
    },

    onLoad () {
        this.world.node.on('change-floor', this.onChangeFloor, this);
    },

    start () {
        const lastFloor = profile.lastFloor;
        this.mask.active = true;
        this.mask.opacity = 255;
        this._changeFloor(lastFloor.id, true, lastFloor.upSymbol)
            .then(() => this._maskOut());
    },

    onChangeFloor (exit) {
        this._maskIn()
            .then(() => this._changeFloor(exit.floorId, exit.isUp, exit.symbol))
            .then(() => this._maskOut());
    },

    onClickSetting () {
        Game.openPanel('setting');
    },

    _changeFloor (floorId, isUp, symbol) {
        return Promise.resolve()
            .then(()=> Game.res.init(floorId))
            .then(()=> this._loadBackground(floorId))
            .then(()=> this.world.initFloor(floorId, isUp, symbol))
            .then(()=> {
                this.hud.changeSite(floorId);
                this._saveLastFloor(floorId, isUp, symbol);
            });
    },

    _maskIn () {
        this.mask.active = true;
        return new Promise(resolve => {
            cc.tween(this.mask)
                .then(cc.fadeIn(0.5))
                .call(resolve)
                .start();
        });
    },

    _maskOut () {
        return new Promise(resolve => {
            cc.tween(this.mask)
                .then(cc.fadeOut(0.5))
                .call(resolve)
                .call(() => this.mask.active = false)
                .start();
        });
    },

    _loadBackground (floorId) {
        const path = `prefabs/game/${floorId == 0 ? 'home_bg' : 'tower_bg'}`;
        return LoaderHelper.loadResByUrl(path).then(prefab => {
            const node = cc.instantiate(prefab);
            this.bg.removeAllChildren();
            this.bg.addChild(node);
        });
    },

    _saveLastFloor (floorId, isUp, symbol) {
        profile.lastFloor = {id: floorId};
        if (isUp) {
            profile.lastFloor.upSymbol = symbol;
        }
        profile.save();
    },
});
