
const LoaderHelper = require('CCLoaderHelper');
const Utils = require('Utils');
const GameConfig = require('GameConfig');
const AnimationManager = require('AnimationManager');

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

const specialMonsterIndexMap = {
    [313]: 107,
    [326]: 5,
    [327]: 107,
    [328]: 107,
};
const specialBodyNameMap = {
    [102]: 'P_102_00',
    [103]: 'P103_00',
    [109]: 'P_109_00',
    [111]: 'P_109_00',
};

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

        roleAction: cc.SpriteAtlas,
        commonAtlas2: cc.SpriteAtlas,
    },

    onLoad () {
        const config = this.resConfig.json;
        this._itemNameMap = config.itemNameMap;
        this._clipNameMap = config.clipNameMap;
        this._triggerClipNameMap = config.triggerClipNameMap;
        this._loadedFloorIds = new Map();
    },

    start () {
        this._animation = AnimationManager.instance;
    },

    init () {
        return Promise.resolve();
    },

    loadMapAssets (floorId) {
        if (this._loadedFloorIds.has(floorId)) {
            return Promise.resolve(this._loadedFloorIds.get(floorId));
        }

        const sceneId = GameConfig.getSceneId(floorId);
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
        const sceneId = GameConfig.getSceneId(floorId);
        const name = `text_scene${sceneId}`;
        return tileset.getSpriteFrame(name);
    },

    getPrefaceIconSpriteFrame (floorId) {
        const tileset = this.getMapTileset(floorId);
        const sceneId = GameConfig.getSceneId(floorId);
        const name = `img_sceneth${sceneId}`;
        return tileset.getSpriteFrame(name);
    },

    getItemSpriteFrame (name) {
        return this.itemAtlas.getSpriteFrame(name);
    },

    getItemSpriteFrameByGid (gid) {
        const name = this._itemNameMap[gid];
        return this.itemAtlas.getSpriteFrame(name);
    },

    getClipByGid (gid) {
        const name = this._clipNameMap[gid];
        if (this._animation.hasClipConfig(name)) {
            return this._animation.getClip(name);
        }
        return null;
    },

    getTriggerClips (gid) {
        const config = this._triggerClipNameMap[gid];
        if (config == null) {
            return {};
        }

        const clips = {};
        if (this._animation.hasClipConfig(config.enter)) {
            clips.enter = this._animation.getClip(config.enter);
        }
        if (this._animation.hasClipConfig(config.exit)) {
            clips.exit = this._animation.getClip(config.exit);
        }
        return clips;
    },

    getSmallBattleBg (floorId) {
        const sceneId = GameConfig.getSceneId(floorId);
        return this.commonAtlas.getSpriteFrame('img_scenebattle' + sceneId);
    },

    getLargeBattleBg (floorId) {
        const sceneId = GameConfig.getSceneId(floorId);
        const url = `battles/battle_${sceneId}`;
        return LoaderHelper.loadResByUrl(url, cc.SpriteFrame);
    },

    getLargeMonster (gid) {
        let index, prefix;
        if (gid >= 126 && gid <= 134) {
            index = gid - 126;
            prefix = 'MB';
        } else if (gid >= 226 && gid <= 329) {
            index = gid - 226;
            prefix = 'M';
        }

        if (index == null) {
            return Promise.resolve(null);
        } else {
            const url = `sprites/${prefix}_${Utils.fixedNumber(index, 2)}_b`;
            return LoaderHelper.loadResByUrl(url, cc.SpriteFrame);
        }
    },

    getSmallMonster (floorId, gid) {
        const atlas = this.getMonsterAtlas(floorId);
        if (atlas == null) {
            return {feet: null, body: null, bodyClip: null};
        }

        let index, prefix;
        if (gid >= 126 && gid <= 134) {
            index = gid - 126;
            prefix = 'MB';
        } else if (gid >= 226 && gid <= 329) {
            index = gid - 226;
            prefix = 'M';
        }
        if (specialMonsterIndexMap[gid]) {
            index = specialMonsterIndexMap[gid];
        }

        let feetName = '', bodyName = '';
        if (index != undefined) {
            feetName = `${prefix}_${Utils.fixedNumber(index, 2)}`;
            bodyName = `${feetName}_00`;
        } else if (specialBodyNameMap[gid]) {
            bodyName = specialBodyNameMap[gid];
        }

        const monster = {};
        monster.feet = atlas.getSpriteFrame(feetName);
        monster.body = atlas.getSpriteFrame(bodyName);
        if (this._animation.hasClipConfig(bodyName)) {
            monster.bodyClip = this._animation.getClipWithAtlas(atlas, bodyName, cc.WrapMode.Loop);
        }
        return monster;
    },

    getSiteNameSpriteFrame (floorId) {
        let id = 0;
        if (floorId > 0) {
            id = Math.floor(floorId / 10) + 1;
        }
        const name = 'text_zonename' + (id + 1);
        return this.itemAtlas.getSpriteFrame(name);
    },

    getEquipNameSpriteFrameByGid (gid) {
        const isSword = GameConfig.isSwordItem(gid);
        const level = GameConfig.getEquipmentLevel(gid);
        const prefix = isSword ? 'text_namesword' : 'text_nameshield';
        const name = `${prefix}${level}`;
        return this.commonAtlas.getSpriteFrame(name);
    },

    getPropertySpriteFrameType (isSword) {
        const name = isSword ? 'text_weapon_at' : 'text_weapon_df';
        return this.commonAtlas.getSpriteFrame(name);
    },
});
