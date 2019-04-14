
const LoaderHelper = require('CCLoaderHelper');

const BaseEntity = require('BaseEntity');
const BaseView = require('BaseView');
const CharacterControl = require('CharacterControl');
const AnimationMotion = require('AnimationMotion');
const Direction = CharacterControl.Direction;

const Game = require('Game');
const Utils = require('Utils')

const fourDirections = [
    {x: 0, y: -1},
    {x: 0, y: 1},
    {x: -1, y: 0},
    {x: 1, y: 0},
];

const specialExitOffset = {
    default: {
        up: {x: 0, y: -1},
        down: {x: 0, y: 1},
    },

    [69]: {
        down: {x: -1, y: 0},
    },

    [86]: {
        up: {x: 0, y: -1},
        down: {x: 0, y: -1},
    },
};

const EntityType = {
    Invalid: -1,
    Monster: 0,
    Item: 1,
    Npc: 2,
    Door: 3,
    Trigger: 4,
    StaticItem: 5,
};

const checkTypeFuncs = [
    ['isMonster', EntityType.Monster],
    ['isItem', EntityType.Item],
    ['isNpc', EntityType.Npc],
    ['isDoor', EntityType.Door],
    ['isTrigger', EntityType.Trigger],
    ['isStaticItem', EntityType.StaticItem],
];
function getEntityType(gid) {
    for (let info of checkTypeFuncs) {
        const func = Game.config[info[0]];
        if (func && func.call(Game.config, gid)) {
            return info[1];
        }
    }
    return EntityType.Invalid;
}

cc.Class({
    extends: cc.Component,

    properties: {
        heroPrefab: cc.Prefab,
        monsterPrefab: cc.Prefab,
        itemPrefab: cc.Prefab,
        npcPrefab: cc.Prefab,
        doorPrefab: cc.Prefab,
        triggerPrefab: cc.Prefab,
        staticItemPrefab: cc.Prefab,
    },

    onLoad () {
        this.node.on('touchstart', this.onTouchWorld, this);
        this._entityPrefabs = [];
        this._entityPrefabs[EntityType.Monster] = this.monsterPrefab;
        this._entityPrefabs[EntityType.Item] = this.itemPrefab;
        this._entityPrefabs[EntityType.Npc] = this.npcPrefab;
        this._entityPrefabs[EntityType.Door] = this.doorPrefab;
        this._entityPrefabs[EntityType.Trigger] = this.triggerPrefab;
        this._entityPrefabs[EntityType.StaticItem] = this.staticItemPrefab;
    },

    lateUpdate () {
        if (this._lateAddList && this._lateAddList.length > 0) {
            this._lateAddList.forEach(obj => {
                Game.mapState.setEntityState(this._floorId, obj.grid, obj.gid);
                this._parseLogicGid(obj.gid, obj.grid.x, obj.grid.y);
            });
            this._lateAddList = [];
        }
    },

    initFloor (floorId, isUp, symbol) {
        if (this._hero == null) {
            this._hero = this._createHero();
        }

        const isFirstInit = this._floorId == undefined;
        this._floorId = floorId;
        this._initMap(floorId);
        this._initPlayer(floorId, isUp, symbol, isFirstInit);
    },

    _initPlayer (floorId, isUp, symbol, isFirstInit) {
        this._hero.node.parent = this.node;
        this._hero.node.active = true;

        let startGrid;
        if (floorId == 0) {
            startGrid = this.getUpGrid(symbol);
        } else {
            startGrid = isUp ? this.getDownGrid(symbol) : this.getUpGrid(symbol);
        }
        this._hero.node.zIndex = startGrid.y;
        this._hero.node.position = this.getPositionAt(startGrid);

        if (isFirstInit || !isUp) {
            this._hero.headingTo(Direction.South);
        } else {
            this._hero.headingTo(Direction.North);
        }
    },

    respawnHero () {
        return LoaderHelper.loadResByUrl('prefabs/game/respawn_mask').then(prefab => {
            const mask = cc.instantiate(prefab);
            mask.zIndex = cc.macro.MAX_ZINDEX - 1;
            this.node.addChild(mask);

            const grid = this._spawnPoint || this.getDownGrid();
            this._hero.node.zIndex = grid.y;
            this._hero.node.position = this.getPositionAt(grid);
            this._hero.node.active = false;
            this._showAnimation(grid, 'prefabs/game/respawn_hero', () => {
                this._hero.node.active = true;
                mask.destroy();
            });

            const hpStep = Game.player.maxHp * 0.1;
            this.schedule(() => {
                Game.player.hp += hpStep;
            }, 0.1, 10, 0);
        });
    },

    getMapSize () {
        return this._mapSize;
    },

    getTileSize () {
        return this._tileSize;
    },

    getPositionAt (posOrX, y) {
        const pos = this._layerFloor.getPositionAt(posOrX, y);
        pos.x += this._tileSize.width/2.0;
        pos.y += this._tileSize.height/2.0;
        return pos;
    },

    getGridAt (pos, posY) {
        pos = this._posArgs(pos, posY);
        const x = Math.floor((pos.x+0.5) / this._tileSize.width);
        const y = (this._mapSize.height-1) - Math.floor((pos.y+0.5)/this._tileSize.height);
        return cc.v2(x, y);
    },

    setLogicTileGidAt (gid, posOrX, flagsOrY, flags) {
        try {
            this._layerLogic.setTileGIDAt(gid, posOrX, flagsOrY, flags);
        } catch (err) {
            cc.warn(err);
            cc.warn(gid, posOrX, flagsOrY || '');
        }
    },

    getLogicTileGidAt (pos, y) {
        return this._layerLogic.getTileGIDAt(pos, y);
    },

    isReachable (x, y) {
        if (!this._isValidGridXY(x, y)) {
            return false;
        }
        if (this._getExit(x, y)) {
            return true;
        }
        
        return this._layerFloor.getTileGIDAt(x, y) > 0
            && (this._layerLogic.getTileGIDAt(x, y) === 0
                || this._hasEntity(x, y));
    },

    searchPath (start, target) {
        return this._search && this._search(start, target);
    },

    getUpGrid (symbol) {
        for (const obj of this._upGrids) {
            if (!symbol || obj.symbol === symbol) return obj.grid;
        }
        return null;
    },

    getDownGrid (symbol) {
        for (const obj of this._downGrids) {
            if (!symbol || obj.symbol === symbol) return obj.grid;
        }
        return null;
    },

    removeEntity (grid) {
        if (cc.isValid(this._entities[grid.y][grid.x])) {
            this._entities[grid.y][grid.x].destroy();
            Game.mapState.removeEntity(this._floorId, grid);
        }
    },

    onTouchWorld (event) {
        const touch = event.touch;
        const pos = this.node.convertToNodeSpaceAR(touch.getLocation());
        const targetGrid = this.getGridAt(pos);
        if (!this.isReachable(targetGrid.x, targetGrid.y)) {
            this._showForbidAnimation(targetGrid);
            return;
        }

        const startGrid = this.getGridAt(this._hero.getNextPosition());
        const path = this.searchPath(startGrid, targetGrid);
        this._showTargetAnimation(targetGrid);
        if (path && path.length > 0) {
            this._hero.followPath(path.map(grid => this.getPositionAt(grid)));
        }
    },

    _showForbidAnimation (grid) {
        this._showAnimation(grid, 'prefabs/game/gb_stop');
        Game.audio.playEffect('forbid-click');
    },

    _showTargetAnimation (grid) {
        this._showAnimation(grid, 'prefabs/game/gb_target');
    },

    _showAnimation (grid, prefabPath, callback) {
        LoaderHelper.loadResByUrl(prefabPath, cc.Prefab).then(prefab => {
            const node = cc.instantiate(prefab);
            node.position = this.getPositionAt(grid);
            node.zIndex = cc.macro.MAX_ZINDEX;
            node.getComponent(cc.Animation).on('finished', () => {
                if (callback) {
                    callback();
                }
                node.destroy();
            });
            this.node.addChild(node);
        });
    },

    onBeforeEnterPosition (sender, pos, passCallback) {
        // const grid = this.getGridAt(pos);
        // sender.node.zIndex = grid.y;
        this._onEntityEvent('BeforeEnter', sender, pos, passCallback);
    },

    onAfterEnterPosition (sender, pos, passCallback) {
        const grid = this.getGridAt(pos);
        const exit = this._getExit(grid);
        sender.node.zIndex = grid.y;
        if (exit) {
            this.node.emit('change-floor', exit);
            passCallback(false);
        } else {
            this._onEntityEvent('AfterEnter', sender, pos, passCallback);
        }
    },

    onAfterExitPosition (sender, pos, passCallback) {
        this._onEntityEvent('AfterExit', sender, pos, passCallback);
    },

    onBeforeExitPosition (sender, pos, passCallback) {
        this._onEntityEvent('BeforeExit', sender, pos, passCallback);
    },

    _onEntityEvent (eventName, sender, pos, passCallback) {
        const grid = this.getGridAt(pos);
        if (!this._hasEntity(grid)) {
            return passCallback(true);
        }

        const entity = this._entities[grid.y][grid.x];
        const base = entity.getComponent(BaseEntity);
        cc.log(eventName, base.gid);
        const handlerName = `on${eventName}`;
        const passCheckName = `is${eventName}Pass`;
        passCallback(base[passCheckName]);
        base[handlerName].call(base, sender);
    },

    onTriggerEnter (sender) {
        const openGid = sender.gid + 1;
        const entity = this._findEntity(openGid);
        if (!entity) return;

        const base = entity.getComponent(BaseEntity);
        if (base.open) {
            base.open();
        }
    },

    onAddEntity (sender) {
        this._lateAddList = this._lateAddList || [];
        this._lateAddList.push({
            gid: sender.entityGid,
            grid: sender.grid,
        });
    },

    _getExit (pos, posY) {
        pos = this._posArgs(pos, posY);
        for (const exit of this._exits) {
            if (exit.grid.x === pos.x && exit.grid.y === pos.y) {
                return exit;
            }
        }
    },

    _findEntity (gid) {
        for (let y = 0; y < this._mapSize.height; y++) {
            for (let x = 0; x < this._mapSize.width; x++) {
                const entity = this._entities[y][x];
                if (!entity) continue;

                const base = entity.getComponent(BaseEntity);
                if (base.gid === gid) return entity;
            }
        }
    },

    _createHero () {
        const node = cc.instantiate(this.heroPrefab)
        const motion = node.getComponent(AnimationMotion);
        const mode = cc.WrapMode.Loop;
        const animation = Game.animation;
        motion.addStandClip(Direction.East, animation.getClip('walk_hr', mode));
        motion.addStandClip(Direction.South, animation.getClip('walk_hb', mode));
        motion.addStandClip(Direction.West, animation.getClip('walk_hl', mode));
        motion.addStandClip(Direction.North, animation.getClip('walk_hf', mode));
        motion.addWalkClip(Direction.East, animation.getClip('walk_r', mode));
        motion.addWalkClip(Direction.South, animation.getClip('walk_b', mode));
        motion.addWalkClip(Direction.West, animation.getClip('walk_l', mode));
        motion.addWalkClip(Direction.North, animation.getClip('walk_f', mode));
        motion.stand(Direction.South);

        node.on('before-enter-position', this.onBeforeEnterPosition, this);
        node.on('after-enter-position', this.onAfterEnterPosition, this);
        node.on('before-exit-position', this.onBeforeExitPosition, this);
        node.on('after-exit-position', this.onAfterExitPosition, this);

        node.on('character-stand', () => {
            Game.audio.stopEffect('run');
        });
        node.on('character-walk', () => {
            Game.audio.playEffect('run', true);
        });

        return node.getComponent(CharacterControl);
    },

    _initMap (floorId) {
        this._hero.node.parent = this.node.parent;
        this._hero.node.active = false;

        const assets = Game.res.getMapAssets(floorId);
        this._tileset = assets.tileset;

        const tiledMap = new cc.Node();
        this.node.removeAllChildren();
        this.node.addChild(tiledMap);
        this._tiledMap = tiledMap.addComponent(cc.TiledMap);
        this._tiledMap.tmxAsset = assets.map;
        tiledMap.active = false;

        this._mapSize = this._tiledMap.getMapSize();
        this._tileSize = this._tiledMap.getTileSize();
        this._entities = Utils.create2dArray(this._mapSize.width, this._mapSize.height);
        this._initLayers();
        this._initSearch();
    },

    _initLayers () {
        this._layerFloor = this._tiledMap.getLayer('floor');
        this._layerLogic = this._tiledMap.getLayer('logic');
        if (CC_DEBUG) {
            cc.log('------- floor:', this._floorId);
            this._printLayer('floor', this._layerFloor);
            this._printLayer('logic', this._layerLogic);
        }
        this._initLayerFloor();
        this._initLayerLogic();
        this._initExits();
    },

    _initLayerFloor () {
        this._initLayerTiles(this._layerFloor, true);
    },

    _initLayerLogic () {
        this._initLayerTiles(this._layerLogic, false);

        for (let y = 0; y < this._mapSize.height; y++) {
            for (let x = 0; x < this._mapSize.width; x++) {
                const gid = this._layerLogic.getTileGIDAt(x, y);
                let state = Game.mapState.getEntityState(this._floorId, cc.v2(x, y));
                if (this._floorId === 0 && Game.config.isNpc(gid)) {
                    if (!Game.taskState.isTaskEnd(gid) && gid != Game.config.NPC_BEI_ER) {
                        this._layerLogic.setTileGIDAt(0, x, y);
                        continue;
                    }
                }

                if (Game.instance.isMonsterRespawn && Game.config.isMonster(gid)) {
                    state = gid;
                }

                if (state === null) {
                    this._parseLogicGid(gid, x, y);
                } else if (state === 0) {
                    this._layerLogic.setTileGIDAt(0, x, y);
                } else {
                    this._parseLogicGid(state, x, y);
                }
            }
        }
    },

    _initExits () {
        const hero = this._tiledMap.getObjectGroup('hero');
        this._exits = [];
        this._upGrids = [];
        this._downGrids = [];
        this._spawnPoint = null;
        for (const properties of hero.getObjects()) {
            for (const key in properties) {
                if (!/FL/.test(key)) {
                    continue;
                }

                const match = key.match(/\d+/);
                const id = Number.parseInt(match[0]);
                const exit = {};
                const symbol = properties[key];
                exit.grid = this.getGridAt(properties.x, properties.y);
                exit.floorId = id;
                exit.symbol = symbol;
                if (symbol == 'z') {
                    this._spawnPoint = exit.grid;
                } else {
                    const standGrid = {grid: cc.v2(exit.grid), symbol: symbol};
                    if (exit.floorId > this._floorId) {
                        this._upGrids.push(standGrid);
                        exit.isUp = true;
                    } else if (exit.floorId < this._floorId) {
                        this._downGrids.push(standGrid);
                        exit.isDown = true;
                    } else {
                        this._upGrids.push(standGrid);
                        this._downGrids.push(standGrid);
                    }
                    this._checkExitOffset(exit);
                    this._exits.push(exit);
                    this.setLogicTileGidAt(0, exit.grid);
                }
            }
        }
        cc.log('exits:', this._exits);
    },

    _checkExitOffset (exit) {
        const defaultOffset = specialExitOffset.default;
        const offsetConfig = specialExitOffset[this._floorId] || defaultOffset;
        const up = offsetConfig.up || defaultOffset.up;
        const down = offsetConfig.down || defaultOffset.down;
        const offset = exit.isUp ? up : down;
        exit.grid.x += offset.x;
        exit.grid.y += offset.y;
    },

    _initLayerTiles (layer, isFloor) {
        if (this._floorId == 0) {
            return;
        }

        for (let y = 0; y < this._mapSize.height; y++) {
            for (let x = 0; x < this._mapSize.width; x++) {
                const gid = layer.getTileGIDAt(x, y);
                const spriteFrame = this._tileset.getSpriteFrame(gid.toString());
                if (gid === 0 || spriteFrame == null) {
                    continue;
                }

                const tile = new cc.Node();
                const sprite = tile.addComponent(cc.Sprite);
                sprite.trim = cc.Sprite.Type.SIMPLE;
                sprite.sizeMode = cc.Sprite.SizeMode.RAW;
                sprite.spriteFrame = spriteFrame;
                tile.anchorX = 0;
                tile.anchorY = 0;
                tile.position = layer.getPositionAt(x, y);
                tile.zIndex = isFloor ? 0 : y;
                this.node.addChild(tile);
            }
        }
    },

    _parseLogicGid (gid, x, y) {
        const checkAddEventTrigger = (gid, node) => {
            const event = Game.data.getEvent(this._floorId, gid);
            if (event) {
                const add = compName => {
                    const trigger = node.addComponent(compName);
                    trigger.init(event);
                };
                if (event.TASKGIFT) {
                    add('EventGift');
                }
                if (event.TALK) {
                    add('EventTalk');
                }
                if (event.TASK) {
                    add('EventTask');
                }
                if (event.TASKAWARD) {
                    add('EventAward');
                }
                if (event.ADDENTITY) {
                    add('EventAddEntity');
                }
                if (event.SHOPTALK) {
                    add('EventShop');
                }
            }

            node.on('trigger-enter', this.onTriggerEnter, this);
            node.on('add-entity', this.onAddEntity, this);
        };

        const overideDestroy = (node) => {
            const oldDestroy = node.destroy;
            node.destroy = () => {
                oldDestroy.call(node, ...arguments);
                this._removeEntity(x, y);
                Game.mapState.removeEntity(this._floorId, cc.v2(x, y));
            };
        };

        const entityType = getEntityType(gid);
        if (entityType !== EntityType.Invalid) {
            const prefab = this._entityPrefabs[entityType];
            const node = cc.instantiate(prefab);
            const entity = node.getComponent(BaseEntity);
            entity.gid = gid;
            entity.floorId = this._floorId;
            entity.grid = cc.v2(x, y);
            entity.type = entityType;

            node.getComponent(BaseView).init(gid);
            node.zIndex = y;
            node.position = this.getPositionAt(x, y);
            node.parent = this.node
            this._entities[y][x] = node;
            this._layerLogic.setTileGIDAt(0, x, y);

            checkAddEventTrigger(gid, node);
            overideDestroy(node);
        } 
        else if (Game.config.isUnknown(gid)) {
            this._layerLogic.setTileGIDAt(0, x, y);
        }
    },

    _initSearch () {
        const GridGraph = require('GridGraph');
        const AStarSearch = require('AStarSearch');
        const Heuristic = require('Heuristic');

        const self = this;
        const defautCost = 1;
        const entityTypeCosts = [];
        entityTypeCosts[EntityType.Monster] = 100;
        entityTypeCosts[EntityType.Item] = 1;
        entityTypeCosts[EntityType.Npc] = 100;
        entityTypeCosts[EntityType.Door] = 2;
        entityTypeCosts[EntityType.Trigger] = 1;
        entityTypeCosts[EntityType.StaticItem] = 100;

        function getToGridCost(grid) {
            const entity = self._entities[grid.y][grid.x];
            if (entity == null) {
                return defautCost;
            }
            const gid = entity.getComponent(BaseEntity).gid;
            const type = getEntityType(gid);
            return entityTypeCosts[type] || defautCost;
        }

        // create GridGraph
        const mapSize = this.getMapSize();
        const walkableGrids = [];
        for (let y = 0; y < mapSize.height; ++y) {
            for (let x = 0; x < mapSize.width; ++x) {
                if (this.isReachable(x, y)) {
                    const grid = {x, y};
                    walkableGrids.push(grid);
                }
            }
        }
        const worldGraph = new GridGraph(mapSize, walkableGrids, false);

        // create AStarSearch
        const index2grid = index => worldGraph.index2grid(index);
        const heuristc = Heuristic.create(Heuristic.Type.Manhattan, index2grid);
        const getNeighbors = index => worldGraph.getNodeNeighbors(index);
        const getEdgeCost = (from, to) => getToGridCost(index2grid(to));
        const search = new AStarSearch(worldGraph.maxSize, getNeighbors, getEdgeCost, heuristc);
        
        this._search = (startGrid, targetGrid) => {
            const start = worldGraph.grid2index(startGrid.x, startGrid.y);
            const target = worldGraph.grid2index(targetGrid.x, targetGrid.y);
            const isFound = search.search(start, target);
            if (!isFound) {
                return [];
            }
            return search.path.map(index => worldGraph.index2grid(index));
        };
    },

    _hasNpc (pos, y) {
        pos = this._posArgs(pos, y);
        const entity = this._entities[pos.y][pos.x];
        return entity && entity.getComponent(BaseEntity).type === EntityType.Npc;
    },

    _hasEntity (pos, y) {
        pos = this._posArgs(pos, y);
        return !!this._entities[pos.y][pos.x];
    },

    _removeEntity (x, y) {
        this._entities[y][x] = null;
    },

    _isValidGrid (grid) {
        return grid.x >= 0 && grid.x < this._mapSize.width
            && grid.y >= 0 && grid.y < this._mapSize.height;
    },

    _isValidGridXY (x, y) {
        return x >= 0 && x < this._mapSize.width
            && y >= 0 && y < this._mapSize.height;
    },

    _posArgs (pos, y) {
        if (y === undefined)
            return pos;
        return cc.v2(pos, y);
    },

    _printLayer (name, layer) {
        cc.log('------------', name);
        const str = [];
        for (let y = 0; y < this._mapSize.height; ++y) {
            const s = [];
            for (let x = 0; x < this._mapSize.width; ++x) {
                const gid = layer.getTileGIDAt(x, y);
                s.push(Utils.fixedNumber(gid, 3));
            }
            str.push(s.join(' '));
        }
        cc.log(str.join('\n'));
    },
});
