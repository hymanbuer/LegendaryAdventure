

const TaskState = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
    },

    onLoad () {
        TaskState.instance = this;
        this._stateMap = new Map();
    },

    onDestroy () {
        TaskState.instance = null;
    },

    getTaskState (gid) {
        gid = Number.parseInt(gid);
        return this._stateMap.get(gid) || 0;
    },

    setTaskState (gid, state) {
        gid = Number.parseInt(gid);
        this._stateMap.set(gid, state);
        cc.log(this._stateMap);
    }
});
