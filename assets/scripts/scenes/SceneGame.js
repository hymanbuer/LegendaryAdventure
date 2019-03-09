
const LoaderHelper = require('CCLoaderHelper');
const CharacterControl = require('CharacterControl');
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

        atlas: cc.SpriteAtlas,
        heroPrefab: cc.Prefab,
    },

    onLoad () {
        this.node.on('changefloor', this.onChangeFloor, this);
        this.node.on('getitem', this.onUpdateNumItems, this);
        this.node.on('useitem', this.onUpdateNumItems, this);
    },

    start () {
        const floorId = profile.lastFloorId;
        this.mask.active = true;
        DataCenter.instance.init()
            .then(()=> this._loadBackground(floorId))
            .then(()=> Resources.instance.init(floorId))
            .then(()=> this.world.init(floorId))
            .then((start)=> {
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
        this._isChangingFloor = true;
        this._maskIn(()=> {
            Resources.instance.init(exit.floorId)
                .then(()=> this._loadBackground(exit.floorId))
                .then(()=> this.world.initFloor(exit.floorId))
                .then(()=> {
                    if (exit.isUp)
                        this._placeHeroAt(this.world.getDownGrid(exit.symbol));
                    else
                        this._placeHeroAt(this.world.getUpGrid(exit.symbol));
                    
                    this.hud.changeSite(exit.floorId);
                    this._maskOut(()=> this._isChangingFloor = false);

                    profile.lastFloorId = exit.floorId;
                    profile.save();
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
        const node = cc.instantiate(this.heroPrefab)
        node.parent = this.world.node;
        this.hero = node.getComponent(CharacterControl);
        this.hero.world = this.world;
        this.hero.placeAt(grid);
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
            node.zIndex = cc.macro.MAX_ZINDEX;
            node.getComponent(cc.Animation).on('finished', node.destroy, node);
            this.world.node.addChild(node);
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
});
