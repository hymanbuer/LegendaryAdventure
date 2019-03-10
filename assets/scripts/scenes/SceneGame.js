
const LoaderHelper = require('CCLoaderHelper');
const World = require('World');
const DataCenter = require('DataCenter');
const HudControl = require('HudControl');
const Resources = require('Resources');
const PanelManager = require('PanelManager');

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
        this.node.on('changefloor', this.onChangeFloor, this);
        this.node.on('getitem', this.onUpdateNumItems, this);
        this.node.on('useitem', this.onUpdateNumItems, this);
    },

    start () {
        const lastFloor = profile.lastFloor;
        this.mask.active = true;
        DataCenter.instance.init()
            .then(()=> this._changeFloor(lastFloor.id, true, lastFloor.upSymbo));
    },

    onChangeFloor (event) {
        const exit = event.detail;
        this._maskIn()
            .then(()=> this._changeFloor(exit.floorId, exit.isUp, exit.symbol));
    },

    onUpdateNumItems (event) {
        const gid = event.detail;
        if (gid == 155 || gid == 156 || gid == 157) {
            this.hud.updateNumKeys();
        }
    },

    onClickSetting () {
        PanelManager.instance.openPanel('setting');
    },

    _changeFloor (floorId, isUp, symbol) {
        return Promise.resolve()
            .then(()=> Resources.instance.init(floorId))
            .then(()=> this._loadBackground(floorId))
            .then(()=> this.world.initFloor(floorId, isUp, symbol))
            .then(()=> {
                this.hud.changeSite(floorId);
                this._maskOut();
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
