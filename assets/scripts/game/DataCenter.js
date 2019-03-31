
const Utils = require('Utils');
const GameConfig = require('GameConfig');

cc.Class({
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

    getItemInfo (gid) {
        gid = Number.parseInt(gid);
        return this._monsterMap.get(gid);
    },

    getPreface (floorId) {
        const name = `FLOOR${Utils.fixedNumber(floorId, 2)}PERFACE`;
        const config = this.eventConfig.json[name];
        if (config && typeof config == 'object') {
            return {
                name: config.NAME,
                title: config.TITLE,
                text: config.MESSAGE,
            };
        }
        return null;
    },

    getTask (taskId) {
        return this._tasks[taskId];
    },

    getLevelInfo (level) {
        return this._playerLevelInfos[level];
    },

    _handleEvent (obj) {
        this._parseFloors(obj.FLOOR);
        this._parseTasks(obj.MISSIONDESCRIPTION);
    },

    _handlePlayer (obj) {
        this._playerLevelInfos = new Array(GameConfig.maxLevels + 1);
        for (const config of obj) {
            const info = {
                level: Number.parseInt(config.ID),
                nextExp: Number.parseInt(config.NEEDEXP),
                hp: Number.parseInt(config.HP),
                attack: Number.parseInt(config.ATT),
                defence: Number.parseInt(config.DEF),
            };
            this._playerLevelInfos[info.level] = info;
        }
    },

    _handleMonster (obj) {
        this._monsterMap = new Map();
        for (const monster of obj) {
            const gid = Number.parseInt(monster.ID);
            this._monsterMap.set(gid, monster);
        }
    },

    _parseFloors (FLOORS) {
        this._eventMapList = new Array(GameConfig.maxFloors + 1);
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

    _parseTasks (TASKS) {
        this._tasks = new Array(GameConfig.maxTasks + 1);
        for (let info of TASKS.GID) {
            const taskId = Number.parseInt(info.ID);
            const name = info.MISSIONNAME;
            const runningMessage = info.RUNNINGMESSAGE;
            const finishedMessage = info.FINISHMESSAGE;
            this._tasks[taskId] = {
                taskId, name, runningMessage, finishedMessage
            };
        }
    },
});
