
const State = cc.Enum({
    New: 0,
    Accepted: 1,
    Finished: 2,
});

const TaskState = cc.Class({
    ctor () {
        this._stateMap = new Map();
    },

    getTaskState (gid) {
        gid = Number.parseInt(gid);
        return this._stateMap.get(gid) || State.New;
    },

    setTaskState (gid, state) {
        gid = Number.parseInt(gid);
        this._stateMap.set(gid, state);
        cc.log(this._stateMap);
    }
});

TaskState.TaskState = State;
