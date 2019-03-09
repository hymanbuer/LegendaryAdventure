
const LoaderHelper = require('CCLoaderHelper');
const CharacterControl = require('CharacterControl');
const World = require('World');
const DataCenter = require('DataCenter');
const HudControl = require('HudControl');
const Resources = require('Resources');
const PanelManager = require('PanelManager');

cc.Class({
    extends: cc.Component,

    properties: {
        hud: HudControl,
        hero: CharacterControl,
        world: World,
        mask: cc.Node,

        atlas: cc.SpriteAtlas,
    },

    onLoad () {
        this.node.on('changefloor', this.onChangeFloor, this);
        this.node.on('getitem', this.onUpdateNumItems, this);
        this.node.on('useitem', this.onUpdateNumItems, this);
        this.mask.active = true;
    },

    start () {
        const floorId = 2;
        const start = cc.v2(3, 7);
        DataCenter.instance.init()
            .then(()=> Resources.instance.init(floorId))
            .then(()=> this.world.init(floorId))
            .then(()=> {
                this.hud.changeSite(floorId);
                this._placeHeroAt(start);
                this._maskOut();
            });
    },

    onTouchBoard (event) {
        if (this._isChangingFloor) return;

        const touch = event.touch;
        const pos = this.world.node.convertToNodeSpaceAR(touch.getLocation());
        const grid = this.world.getGridAt(pos);
        if (!this.world.isReachable(grid)) {
            this._showForbidAnimation(grid);
            return;
        }

        const path = this.world.searchPath(this.hero.grid, grid);
        if (path && path.length > 0) {
            this._showTargetAnimation(grid);
            this.hero.followPath(path);
        }
    },

    onChangeFloor (event) {
        const exit = event.detail;
        const floorId = event.detail;
        this.hero.node.parent = this.world.node;
        this._isChangingFloor = true;
        this._maskIn(()=> {
            Resources.instance.init(exit.floorId)
                .then(()=> this.world.initFloor(exit.floorId))
                .then(()=> {
                    if (exit.isUp)
                        this._placeHeroAt(this.world.getDownGrid(exit.symbol));
                    else
                        this._placeHeroAt(this.world.getUpGrid(exit.symbol));
                    
                    this.hud.changeSite(exit.floorId);
                    this._maskOut(()=> this._isChangingFloor = false);
                });
        });
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

    _maskIn (callback) {
        callback = callback || function () {};
        this.mask.opacity = 0;
        this.mask.runAction(cc.sequence(cc.fadeIn(0.5), cc.callFunc(callback)));
    },

    _maskOut (callback) {
        callback = callback || function () {};
        this.mask.opacity = 255;
        this.mask.runAction(cc.sequence(cc.fadeOut(0.5), cc.callFunc(callback)));
    },

    _placeHeroAt (grid) {
        this.hero.placeAt(grid);
        this.hero.parent = this.world.getLogicLayer();
    },

    _showForbidAnimation (grid) {
        this._showAnimation(grid, 'prefabs/game/gb_stop');
    },

    _showTargetAnimation (grid) {
        this._showAnimation(grid, 'prefabs/game/gb_target');
    },

    _showAnimation (grid, prefabPath) {
        LoaderHelper.loadResByUrl(prefabPath, cc.Prefab).then(prefab => {
            const node = cc.instantiate(prefab);
            node.position = this.world.getPositionAt(grid);
            node.getComponent(cc.Animation).on('finished', node.destroy, node);
            this.world.node.addChild(node);
        });
    }
});
