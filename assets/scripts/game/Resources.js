
const LoaderHelper = require('CCLoaderHelper');

const spriteMap = new Map();
spriteMap.set(151, 'Blood');
spriteMap.set(153, 'redgem');
spriteMap.set(155, 'yellowkey');
spriteMap.set(156, 'bluekey');
spriteMap.set(157, 'redkey');
spriteMap.set(159, 'mirror');

const maxSceneId = 10;
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

function getSceneId(floorId) {
    let sceneId = Math.floor(floorId / 10);
    sceneId += floorId % 10 === 0 ? 0 : 1;
    return sceneId;
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

const Resources = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        itemAtlas: cc.SpriteAtlas,
        commonAtlas: cc.SpriteAtlas,
        monsterAtlasList: [cc.SpriteAtlas],
    },

    onLoad () {
        Resources.instance = this;
    },

    onDestroy () {
        Resources.instance = null;
    },

    init (floorId) {
        return this.preloadMonsterAtlas(floorId);
    },

    preloadMonsterAtlas (floorId) {
        const sceneId = getSceneId(floorId);
        if (sceneId == 0) {
            return Promise.resolve();
        }
        
        const atlasUrl = 'sheets/monsters/' + monsterAtlasNames[sceneId - 1];
        return LoaderHelper.loadResByUrl(atlasUrl, cc.SpriteAtlas).then(atlas => {
            this.monsterAtlasList[sceneId] = atlas;
        });
    },

    getSpriteFrame (gid) {
        gid = Number.parseInt(gid);
        const name = spriteMap.get(gid);
        return this.itemAtlas.getSpriteFrame(name);
    },

    getSmallBattleBg (floorId) {
        const sceneId = getSceneId(floorId);
        return this.commonAtlas.getSpriteFrame('img_scenebattle' + sceneId);
    },

    getSmallMonster (floorId, gid) {
        if (gid < 226 || gid > 226+109) return null;

        const id = gid - 226;
        const sceneId = getSceneId(floorId);
        const atlas = this.monsterAtlasList[sceneId];
        const name = `M_${fixedNumber(id, 2)}_00`;
        return atlas ? atlas.getSpriteFrame(name) : null;
    },
});
