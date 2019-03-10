
const LoaderHelper = require('CCLoaderHelper');
const DataCenter = require('DataCenter');
const MapState = require('MapState');

const EntityViewConfig = require("EntityViewConfig");
const EntityView = require('EntityView');

const EventTrigger = require('EventTrigger');
const BaseEntity = require('BaseEntity');
const EntityMonster = require('EntityMonster');
const EntityItem = require('EntityItem');
const EntityDoor = require('EntityDoor');
const EntityTrigger = require('EntityTrigger');

const fourDirections = [
    {x: 0, y: -1},
    {x: 0, y: 1},
    {x: -1, y: 0},
    {x: 1, y: 0},
];

const itemGidSet = new Set([
    151, 153, 154, 155, 156, 157, 158, 159, 401,
]);
const doorGidSet = new Set([
    351, 352, 353, 354, 355, 356, 357, 358, 359,
    410, 411, 412, 413, 414, 415,
    360, 403, 404, 821, 1001,
]);
const otherGidSet = new Set([
    405, // 插着石中剑的石头
    406, // 拨了石中剑的石头
    409,
]);
const triggerGidSet = new Set([
    408,
]);

const maxSceneId = 9;
const tilesetNames = [
    'TiledMapOne',
    'TiledMapTwo',
    'TiledMapThree',
    'TiledMapFour',
    'TiledMapFive',
    'TiledMapSix',
    'TiledMapSeven',
    'TiledMapEight',
    'TiledMapNine',
    'TiledMapTen',
];
const monsterAtlasNames = [
    'MonsterOne',
    'MonsterTwo',
    'MonsterThree',
    'MonsterFour',
    'MonsterFive',
    'MonsterSix',
    'MonsterSeven',
    'MonsterEight',
    'MonsterNine',
    'MonsterTen',
];

const EntityType = cc.Enum({
    Item: -1,
    Monster: -1,
    Trigger: -1,
    Npc: -1,
});

function create2dArray(width, height, defaultValue) {
    const ret = [];
    for (let i = 0; i < height; i++) {
        ret.push(new Array(width).fill(defaultValue));
    }
    return ret;
}

function fill2dArray(array, value) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[0].length; j++) {
            array[i][j] = value;
        }
    }
}

function isSameGrid(a, b) {
    return a.x === b.x && a.y === b.y;
}

function fixedNumber(value, n) {
    const digits = [];
    while (n > 0) {
        digits.push(value % 10);
        value = Math.floor(value / 10);
        n -= 1;
    }
    digits.reverse();
    return digits.join('');
}

cc.Class({
    extends: cc.Component,

    properties: {
        itemAtlas: cc.SpriteAtlas,
        monsterPrefab: cc.Prefab,
        itemPrefab: cc.Prefab,
        triggerPrefab: cc.Prefab,
        heroPrefab: cc.Prefab,
    },

    onLoad () {
        this.node.on('standopen', this.onStandOpen, this);
        this.node.on('addentity', this.onAddEntity, this);
        this.node.on('touchstart', this.onTouchWorld, this);
    },

    init (floorId, isUp, symbol) {
        this._npcViewConfigMap = EntityViewConfig.createNpcMap(this.itemAtlas);
        this._itemViewConfigMap = EntityViewConfig.createItemMap(this.itemAtlas);

        return this.initFloor(floorId, isUp, symbol)
            .then(() => this._hero.faceUp(false));
    },

    initFloor (floorId, isUp, symbol) {
        const sceneId = Math.min(maxSceneId, Math.floor(floorId/10));
        const tilesetUrl = 'sheets/tilesets/' + tilesetNames[sceneId];
        const atlasUrl = 'sheets/monsters/' + monsterAtlasNames[sceneId];
        this._floorId = floorId;
        this.node.removeAllChildren();
        this.node.removeAllChildren();

        return LoaderHelper.loadResByUrl(tilesetUrl, cc.SpriteAtlas)
            .then((asset)=> {
                this._mapTileset = asset;
                return LoaderHelper.loadResByUrl(atlasUrl, cc.SpriteAtlas)
            })
            .then((asset)=> {
                this._monsterViewConfigMap = EntityViewConfig.createMonsterMap(asset);
                return new Promise((resolve, reject) => {
                    const mapUrl = `maps/FL${fixedNumber(this._floorId, 3)}`;
                    const p = LoaderHelper.loadResByUrl(mapUrl, cc.TiledMapAsset);
                    p.then(tmxAsset => {
                        this._init(tmxAsset);
                        resolve();
                    }, reject);
                })
            })
            .then(() => {
                if (floorId == 0) {
                    this._placeHeroAt(this.getUpGrid(symbol));
                } else {
                    const startGrid = isUp ? this.getDownGrid(symbol) : this.getUpGrid(symbol);
                    this._placeHeroAt(startGrid);
                }
                this._hero.faceUp(isUp);
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
        this._layerLogic.setTileGIDAt(gid, posOrX, flagsOrY, flags);
    },

    getLogicTileGidAt (pos, y) {
        return this._layerLogic.getTileGIDAt(pos, y);
    },

    isReachable (pos, y) {
        if (this._getExit(pos, y)) return true;
        
        return this._layerFloor.getTileGIDAt(pos, y) > 0
            && (this._layerLogic.getTileGIDAt(pos, y) === 0
                || this._hasEntity(pos, y));
    },

    searchPath (start, target) {
        return this._search && this._search(start, target);
    },

    getUpGrid (symbol) {
        for (const obj of this._upGrids) {
            if (!symbol || obj.symbol === symbol) return obj.upGrid;
        }
        return null;
    },

    getDownGrid (symbol) {
        for (const obj of this._downGrids) {
            if (!symbol || obj.symbol === symbol) return obj.downGrid;
        }
        return null;
    },

    getLogicLayer () {
        return this.node;
    },

    onTouchWorld (event) {
        const touch = event.touch;
        const pos = this.node.convertToNodeSpaceAR(touch.getLocation());
        const grid = this.getGridAt(pos);
        if (!this.isReachable(grid)) {
            this._showForbidAnimation(grid);
            return;
        }

        const path = this.searchPath(this._hero.grid, grid);
        this._showTargetAnimation(grid);
        if (path && path.length > 0) {
            this._hero.followPath(path);
        }
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
            node.position = this.getPositionAt(grid);
            node.zIndex = cc.macro.MAX_ZINDEX;
            node.getComponent(cc.Animation).on('finished', node.destroy, node);
            this.node.addChild(node);
        });
    },

    onBeforeEnter (grid) {
        return this._onEnterEvent(grid, true);
    },

    onAfterEnter (grid) {
        const exit = this._getExit(grid);
        if (exit) {
            const event = new cc.Event.EventCustom('changefloor', true);
            event.detail = exit;
            this.node.dispatchEvent(event);
            return Promise.resolve(false);
        }

        return this._onEnterEvent(grid, false);
    },

    onAfterExit (grid) {
        if (this._hasEntity(grid)) {
            return new Promise(resolve => {
                const entity = this._entities[grid.y][grid.x];
                if (entity) {
                    const base = entity.getComponent(BaseEntity);
                    cc.log('after exit:', base.gid);
                    base.onAfterExit(resolve);
                } else {
                    resolve(true);
                }
            });
        }
    },

    onStandOpen (event) {
        const openGid = event.detail;
        const entity = this._findEntity(openGid);
        if (!entity) return;

        const base = entity.getComponent(BaseEntity);
        const state = entity.getComponent(EntityView).play('open');
        state.on('lastframe', ()=> entity.destroy());
        MapState.instance.removeEntity(base.floorId, base.grid);
    },

    onAddEntity (event) {
        this.scheduleOnce(()=> {
            const info = event.detail;
            this._layerLogic.setTileGIDAt(info.gid, info.x, info.y);
            this._parseLogicGid(info.gid, info.x, info.y);
        }, 0);
    },

    _onEnterEvent (grid, isBefore) {
        if (this._hasEntity(grid)) {
            return new Promise(resolve => {
                const entity = this._entities[grid.y][grid.x];
                if (entity) {
                    const base = entity.getComponent(BaseEntity);
                    cc.log(isBefore ? 'before enter:' : 'after enter:', base.gid);
                    if (isBefore) base.onBeforeEnter(resolve);
                    else base.onAfterEnter(resolve);
                } else {
                    resolve(true);
                }
            });
        }
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

    _placeHeroAt (grid, isUp) {
        const node = cc.instantiate(this.heroPrefab)
        node.parent = this.node;
        this._hero = node.getComponent('CharacterControl');
        this._hero.world = this;
        this._hero.placeAt(grid);
    },

    _init (tmxAsset) {
        const node = new cc.Node();
        this.node.addChild(node);
        this._tiledMap = node.addComponent(cc.TiledMap);
        this._tiledMap.tmxAsset = tmxAsset;
        this._mapSize = this._tiledMap.getMapSize();
        this._tileSize = this._tiledMap.getTileSize();
        this._entities = create2dArray(this._mapSize.width, this._mapSize.height)
        this._initLayers();
        this._initSearch();
    },

    _initLayers () {
        // origin tile layers
        cc.log('------------------------ floor:', this._floorId);
        this._layerLogic = this._tiledMap.getLayer('logic');
        this._layerFloor = this._tiledMap.getLayer('floor');
        this._layerLogic.node.active = false;
        this._layerFloor.node.active = false;
        this._printLayer('floor', this._layerFloor);
        this._printLayer('logic', this._layerLogic);

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
                const state = MapState.instance.getEntityState(this._floorId, cc.v2(x, y));
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
        for (const properties of hero.getObjects()) {
            for (const key in properties) {
                if (/FL/.test(key)) {
                    const match = key.match(/\d+/);
                    const id = Number.parseInt(match[0]);
                    const exit = {};
                    const symbol = properties[key];
                    // spawn point
                    if (symbol == 'z') {
                        continue;
                    }

                    exit.nextFloorName = key;
                    exit.grid = this.getGridAt(properties.x, properties.y);
                    exit.floorId = id;
                    exit.symbol = symbol;
                    this._exits.push(exit);

                    if (exit.floorId > this._floorId) {
                        const upGrid = cc.v2(exit.grid.x, exit.grid.y);
                        this._upGrids.push({upGrid, symbol});
                        exit.grid.y -= 1;
                        exit.isUp = true;
                        this.setLogicTileGidAt(0, exit.grid);
                    } else if (exit.floorId < this._floorId) {
                        const downGrid = cc.v2(exit.grid.x, exit.grid.y);
                        this._downGrids.push({downGrid, symbol});
                        exit.grid.y += 1;
                        exit.isDown = true;
                        this.setLogicTileGidAt(0, exit.grid);
                    }
                }
            }
        }
        hero.node.destroy();
        cc.log('exits:', this._exits);
    },

    _parseLogicGid (gid, x, y) {
        const checkAddEventTrigger = (gid, node) => {
            const event = DataCenter.instance.getEvent(this._floorId, gid);
            if (event) {
                const trigger = node.addComponent(EventTrigger);
                trigger.init(event);
                trigger.gid = gid;
                trigger.floorId = this._floorId;
                trigger.grid = cc.v2(x, y);
            }
        };

        const overideDestroy = (node) => {
            const oldDestroy = node.destroy;
            node.destroy = () => {
                oldDestroy.call(node, ...arguments);
                this._removeEntity(x, y, node);
            };
        };

        if (gid >= 226 && gid <= 226+109) {
            const id = gid - 226;
            const viewConfig = this._monsterViewConfigMap.get(id);
            const monster = cc.instantiate(this.monsterPrefab);
            monster.position = this.getPositionAt(x, y);
            monster.getComponent(EntityView).init(gid, viewConfig);
            this.node.addChild(monster);
            this._entities[y][x] = monster;
            this._layerLogic.setTileGIDAt(0, x, y);

            checkAddEventTrigger(gid, monster);
            overideDestroy(monster);
            monster.zIndex = y;

            const entity = monster.addComponent(EntityMonster);
            entity.gid = gid;
            entity.floorId = this._floorId;
            entity.grid = cc.v2(x, y);

        } else if ((gid >= 1 && gid <= 22) || (gid >= 101 && gid <= 108)) {
            const viewConfig = this._npcViewConfigMap.get(gid);
            const npc = cc.instantiate(this.monsterPrefab);
            npc.position = this.getPositionAt(x, y);
            npc.getComponent(EntityView).init(gid, viewConfig);
            this.node.addChild(npc);
            this._entities[y][x] = npc;
            this._layerLogic.setTileGIDAt(0, x, y);

            checkAddEventTrigger(gid, npc);
            overideDestroy(npc);
            npc.zIndex = y;
            npc.type = EntityType.Npc;

            const entity = npc.addComponent(BaseEntity);
            entity.gid = gid;
            entity.floorId = this._floorId;
            entity.grid = cc.v2(x, y);

        } else if (itemGidSet.has(gid)) {
            const viewConfig = this._itemViewConfigMap.get(gid);
            const item = cc.instantiate(this.itemPrefab);
            item.position = this.getPositionAt(x, y);
            item.getComponent(EntityView).init(gid, viewConfig);
            this.node.addChild(item);
            this._entities[y][x] = item;
            this._layerLogic.setTileGIDAt(0, x, y);

            checkAddEventTrigger(gid, item);
            overideDestroy(item);
            item.zIndex = y;

            const entity = item.addComponent(EntityItem);
            entity.gid = gid;
            entity.floorId = this._floorId;
            entity.grid = cc.v2(x, y);

        } else if (doorGidSet.has(gid)) {
            const viewConfig = this._itemViewConfigMap.get(gid);
            const item = cc.instantiate(this.triggerPrefab);
            item.position = this.getPositionAt(x, y);
            item.getComponent(EntityView).init(gid, viewConfig);
            this.node.addChild(item);
            this._entities[y][x] = item;
            this._layerLogic.setTileGIDAt(0, x, y);

            checkAddEventTrigger(gid, item);
            overideDestroy(item);
            item.zIndex = y;

            const entity = item.addComponent(EntityDoor);
            entity.gid = gid;
            entity.floorId = this._floorId;
            entity.grid = cc.v2(x, y);

        } else if (otherGidSet.has(gid)) {
            const viewConfig = this._itemViewConfigMap.get(gid);
            const item = cc.instantiate(this.itemPrefab);
            item.position = this.getPositionAt(x, y);
            item.getComponent(EntityView).init(gid, viewConfig);
            this.node.addChild(item);
            this._entities[y][x] = item;
            this._layerLogic.setTileGIDAt(0, x, y);

            checkAddEventTrigger(gid, item);
            overideDestroy(item);
            item.zIndex = y;

            const entity = item.addComponent(BaseEntity);
            entity.gid = gid;
            entity.floorId = this._floorId;
            entity.grid = cc.v2(x, y);
        } else if (triggerGidSet.has(gid)) {
            const viewConfig = this._itemViewConfigMap.get(gid);
            const item = cc.instantiate(this.itemPrefab);
            item.position = this.getPositionAt(x, y);
            item.getComponent(EntityView).init(gid, viewConfig);
            this.node.addChild(item);
            this._entities[y][x] = item;
            this._layerLogic.setTileGIDAt(0, x, y);

            checkAddEventTrigger(gid, item);
            overideDestroy(item);
            item.zIndex = y;

            const entity = item.addComponent(EntityTrigger);
            entity.gid = gid;
            entity.floorId = this._floorId;
            entity.grid = cc.v2(x, y);
        }
    },

    _initLayerTiles (layer, isFloor) {
        if (this._floorId == 0) {
            return;
        }
        for (let y = 0; y < this._mapSize.height; y++) {
            for (let x = 0; x < this._mapSize.width; x++) {
                const tile = new cc.Node();
                const sprite = tile.addComponent(cc.Sprite);
                const gid = layer.getTileGIDAt(x, y);
                sprite.trim = cc.Sprite.Type.SIMPLE;
                sprite.sizeMode = cc.Sprite.SizeMode.RAW;
                sprite.spriteFrame = this._mapTileset.getSpriteFrame(gid.toString());
                tile.anchorX = 0;
                tile.anchorY = 0;
                tile.position = layer.getPositionAt(x, y);
                tile.zIndex = isFloor ? 0 : y;
                this.node.addChild(tile);
            }
        }
    },

    _initSearch () {
        const getNeighbors = (grid, target) => {
            const neighbors = [];
            for (const d of fourDirections) {
                const x = grid.x + d.x;
                const y = grid.y + d.y;
                if (!this._isValidGridXY(x, y)) continue;
                if (this._hasNpc(x, y) && !isSameGrid(cc.v2(x, y), target)) continue;
            
                if (this.isReachable(x, y))
                    neighbors.push({x, y});
            }
            return neighbors;
        };

        this._search = this._createSearch(getNeighbors);
    },

    _createSearch (getNeighbors) {
        const width = this._mapSize.width;
        const height = this._mapSize.height;
        const visited = create2dArray(width, height, false);

        function clear() {
            fill2dArray(visited, false);
        }

        function getPath(start, target) {
            if (isSameGrid(start, target)) return [];

            const path = [];
            let last = target;
            do {
                path.unshift(last);
                last = last.parent;
            } while (last && !isSameGrid(start, last));

            return path;
        }

        return (start, target) => {
            clear();

            const queue = [];
            queue.push(start);
            visited[start.y][start.x] = true;
            while (queue.length > 0) {
                const next = queue.shift();
                if (isSameGrid(next, target)) {
                    return getPath(start, next);
                }

                for (const neighbor of getNeighbors(next, target)) {
                    if (!visited[neighbor.y][neighbor.x]) {
                        visited[neighbor.y][neighbor.x] = true;
                        neighbor.parent = next;
                        queue.push(neighbor);
                    }
                }
            }

            return []
        };
    },

    _hasNpc (pos, y) {
        pos = this._posArgs(pos, y);
        const entity = this._entities[pos.y][pos.x];
        return entity && entity.type === EntityType.Npc;
    },

    _hasEntity (pos, y) {
        pos = this._posArgs(pos, y);
        return !!this._entities[pos.y][pos.x];
    },

    _removeEntity (x, y, node) {
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
                s.push(fixedNumber(gid, 3));
            }
            str.push(s.join(' '));
        }
        cc.log(str.join('\n'));
    },
});
