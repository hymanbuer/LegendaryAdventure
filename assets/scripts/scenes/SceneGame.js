
const LoaderHelper = require('CCLoaderHelper');
const Game = require('Game');
const World = require('World');
const HudControl = require('HudControl');
const Preface = require('Preface');

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
        Game.res.init()
            .then(() => this._doChangeFloor(lastFloor.id, true, lastFloor.upSymbol))
            .then(() => this.hud.observePlayerStatus(this.world.getPlayer()))
            .then(() => this._maskOut());
    },

    gotoFloor (floorId) {
        this.onChangeFloor({
            floorId: floorId,
            isUp: true,
        });
    },

    onChangeFloor (exit) {
        if (!Game.taskState.isTaskEnd(Game.config.NPC_BEI_ER)) {
            return;
        }
        if (this._isChangingFloor) {
            return;
        }
        this._isChangingFloor = true;
        this._maskIn()
            .then(() => this._doChangeFloor(exit.floorId, exit.isUp, exit.symbol))
            .then(() => this._checkShowPreface(exit.floorId, exit.isUp))
            .then(() => this._maskOut())
            .then(() => this._isChangingFloor = false);
    },

    _doChangeFloor (floorId, isUp, symbol) {
        return Game.res.loadMapAssets(floorId)
            .then(() => this._loadBackground(floorId))
            .then(() => {
                this.world.initFloor(floorId, isUp, symbol);
                this.hud.changeSite(floorId);
                this._saveLastFloor(floorId, isUp, symbol);
                Game.closeAllPanel();
            });
    },

    _checkShowPreface (floorId, isUp) {
        const config = Game.data.getPreface(floorId);
        if (!config || !isUp) {
            return;
        }
        return LoaderHelper.loadResByUrl('prefabs/game/preface').then(prefab => {
            const node = cc.instantiate(prefab);
            const preface = node.getComponent(Preface);
            node.parent = this.node;
            preface.title.spriteFrame = Game.res.getPrefaceTitleSpriteFrame(floorId);
            preface.icon.spriteFrame = Game.res.getPrefaceIconSpriteFrame(floorId);
            preface.text.string = config.text;
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

            if (floorId == 0 && profile.maxFloorId > 0) {
                node.getChildByName('bubble').active = false;
            }
        });
    },

    _saveLastFloor (floorId, isUp, symbol) {
        profile.lastFloor = {id: floorId};
        if (isUp) {
            profile.lastFloor.upSymbol = symbol;
        }
        if (floorId > profile.maxFloorId) {
            profile.maxFloorId = floorId;
        }
        profile.save();
    },
});
