
const LoaderHelper = require('CCLoaderHelper');
const maxFloors = 105;

const DataCenter = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        
    },

    onLoad () {
        DataCenter.instance = this;
    },

    onDestroy () {
        DataCenter.instance = null;
    },

    init () {
        return new Promise((resolve, reject) => {
            let count = 0;
            const complete = ()=> {
                count += 1;
                if (count === 3) resolve();
            }

            LoaderHelper.loadResByUrl('data/Event').then(res => {
                this._handleEvent(res.json)
                complete();
            }, reject);
            LoaderHelper.loadResByUrl('data/Monster').then(res => {
                this._handleMonster(res.json)
                complete();
            }, reject);
            LoaderHelper.loadResByUrl('data/Player').then(res => {
                this._handlePlayer(res.json)
                complete();
            }, reject);
        });
    },

    getEvent (floorId, gid) {
        gid = Number.parseInt(gid);
        if (this._eventMapList[floorId])
            return this._eventMapList[floorId].get(gid);
        return null;
    },

    getMonster (gid) {
        gid = Number.parseInt(gid);
        return this._monsterMap.get(gid);
    },

    _handleEvent (res) {
        this._eventMapList = new Array(maxFloors);
        const FLOORS = res.FLOOR;
        for (let i = 0; i < FLOORS.length; i++) {
            const floorId = Number.parseInt(FLOORS[i].ID);
            let eventMap = this._eventMapList[floorId];
            if (!eventMap) eventMap = this._eventMapList[floorId] = new Map();

            let GIDS = FLOORS[i].GID;
            if (!(GIDS instanceof Array))
                GIDS = [GIDS];

            for (let j = 0; j < GIDS.length; j++) {
                const event = GIDS[j];
                if (event) {
                    const gid = Number.parseInt(event.ID);
                    eventMap.set(gid, event);
                }
            }
        }
    },

    _handlePlayer (res) {

    },

    _handleMonster (res) {
        this._monsterMap = new Map();
        for (const monster of res) {
            const gid = Number.parseInt(monster.ID);
            this._monsterMap.set(gid, monster);
        }
    },
});
