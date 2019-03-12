
const TaskState = cc.Class({
    ctor () {
        this._stateMap = new Map();
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
