
const LoaderHelper = require('CCLoaderHelper');
const Utils = require('Utils');
const Game = require('Game');

const spriteMap = new Map();
spriteMap.set(151, 'Blood');
spriteMap.set(153, 'redgem');
spriteMap.set(155, 'yellowkey');
spriteMap.set(156, 'bluekey');
spriteMap.set(157, 'redkey');
spriteMap.set(159, 'mirror');

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

const Resources = cc.Class({
    extends: cc.Component,

    properties: {
        itemAtlas: cc.SpriteAtlas,
        commonAtlas: cc.SpriteAtlas,
    },

    onLoad () {
        this._loadedFloorIds = new Map();
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

    getSpriteFrame (gid) {
        gid = Number.parseInt(gid);
        const name = spriteMap.get(gid);
        return this.itemAtlas.getSpriteFrame(name);
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
});
