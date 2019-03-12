
const maxFloors = 105;

const DataCenter = cc.Class({
    extends: cc.Component,

    properties: {
        eventConfig: cc.JsonAsset,
        monsterConfig: cc.JsonAsset,
        playerConfig: cc.JsonAsset,
    },

    onLoad () {
        this._handleEvent(this.eventConfig.json);
        this._handleMonster(this.monsterConfig.json);
        this._handlePlayer(this.playerConfig.json);
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

    _handleEvent (obj) {
        this._eventMapList = new Array(maxFloors);
        const FLOORS = obj.FLOOR;
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

    _handlePlayer (obj) {

    },

    _handleMonster (obj) {
        this._monsterMap = new Map();
        for (const monster of obj) {
            const gid = Number.parseInt(monster.ID);
            this._monsterMap.set(gid, monster);
        }
    },
});
