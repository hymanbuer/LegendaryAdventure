
const LoaderHelper = require('CCLoaderHelper');
const Utils = require('Utils');
const Game = require('Game');

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

function getMapUrl(floorId) {
    return `maps/FL${Utils.fixedNumber(floorId, 3)}`;
}

function getTilesetUrl(sceneId) {
    return `sheets/tilesets/${tilesetNames[sceneId - 1]}`;
}

function getMonsterAtlasUrl(sceneId) {
    return `sheets/monsters/${monsterAtlasNames[sceneId - 1]}`;
}

cc.Class({
    extends: cc.Component,

    properties: {
        itemAtlas: cc.SpriteAtlas,
        commonAtlas: cc.SpriteAtlas,
        resConfig: cc.JsonAsset,
    },

    onLoad () {
        const config = this.resConfig.json;
        this._itemNameMap = config.itemNameMap;
        this._clipNameMap = config.clipNameMap;
        this._triggerClipNameMap = config.triggerClipNameMap;
        this._loadedFloorIds = new Map();
    },

    init () {
        const urls = [
            'sheets/RoleAction',
        ];
        const types = [
            cc.SpriteAtlas,
        ];
        return LoaderHelper.loadResArrayByUrl(urls, types);
    },

    loadMapAssets (floorId) {
        if (this._loadedFloorIds.has(floorId)) {
            return Promise.resolve(this._loadedFloorIds.get(floorId));
        }

        const sceneId = Game.getSceneId(floorId);
        const urls = [];
        const types = [];
        const hasMonster = sceneId > 0;
        urls.push(getMapUrl(floorId));
        types.push(cc.TiledMapAsset);
        if (hasMonster) {
            urls.push(getTilesetUrl(sceneId));
            types.push(cc.SpriteAtlas);
            urls.push(getMonsterAtlasUrl(sceneId));
            types.push(cc.SpriteAtlas);
        }
        return LoaderHelper.loadResArrayByUrl(urls, types)
            .then(assets => {
                const mapAssets = {
                    map: assets[0],
                    tileset: assets[1],
                    monsterAtlas: assets[2],
                    hasMonster: hasMonster,
                };
                this._loadedFloorIds.set(floorId, mapAssets);
                return mapAssets;
            });
    },

    getMapAssets (floorId) {
        return this._loadedFloorIds.get(floorId);
    },

    getMapTileset (floorId) {
        return this.getMapAssets(floorId).tileset;
    },

    getMonsterAtlas (floorId) {
        return this.getMapAssets(floorId).monsterAtlas;
    },

    getPrefaceTitleSpriteFrame (floorId) {
        const tileset = this.getMapTileset(floorId);
        const sceneId = Game.getSceneId(floorId);
        const name = `text_scene${sceneId}`;
        return tileset.getSpriteFrame(name);
    },

    getPrefaceIconSpriteFrame (floorId) {
        const tileset = this.getMapTileset(floorId);
        const sceneId = Game.getSceneId(floorId);
        const name = `img_sceneth${sceneId}`;
        return tileset.getSpriteFrame(name);
    },

    getItemSpriteFrame (name) {
        return this.itemAtlas.getSpriteFrame(name);
    },

    getItemSpriteFrameByGid (gid) {
        // gid = Number.parseInt(gid);
        const name = this._itemNameMap[gid];
        return this.itemAtlas.getSpriteFrame(name);
    },

    getClipByGid (gid) {
        const name = this._clipNameMap[gid];
        if (Game.animation.hasClipConfig(name)) {
            return Game.animation.getClip(name);
        }
        return null;
    },

    getTriggerClips (gid) {
        const config = this._triggerClipNameMap[gid];
        if (config == null) {
            return {};
        }

        const clips = {};
        if (Game.animation.hasClipConfig(config.enter)) {
            clips.enter = Game.animation.getClip(config.enter);
        }
        if (Game.animation.hasClipConfig(config.exit)) {
            clips.exit = Game.animation.getClip(config.exit);
        }
        return clips;
    },

    getSmallBattleBg (floorId) {
        const sceneId = Game.getSceneId(floorId);
        return this.commonAtlas.getSpriteFrame('img_scenebattle' + sceneId);
    },

    getSmallMonster (floorId, gid) {
        if (gid < 226 || gid > 226+109) return null;

        const id = gid - 226;
        const atlas = this.getMonsterAtlas(floorId);
        const name = `M_${Utils.fixedNumber(id, 2)}_00`;
        return atlas ? atlas.getSpriteFrame(name) : null;
    },

    getMonsterSpriteFrame (floorId, name) {
        const atlas = this.getMonsterAtlas(floorId);
        if (atlas) {
            return atlas.getSpriteFrame(name);
        }
        return null;
    },
});