
const State = cc.Enum({
    New: 0,         // 新的未接受的
    Accepted: 1,    // 已接受的，正在进行中
    Finished: 2,    // 已完成但未交接
    End: 3,         // 已交接，终止
});

const TaskState = cc.Class({
    mixins: [cc.EventTarget],

    ctor () {
        this._stateMap = new Map();
        this._needMap = new Map();
    },

    load (taskState) {
        if (taskState == null) {
            return;
        }
        taskState.forEach(task => {
            this._stateMap.set(task.taskId, task.state);
            if (task.need) {
                this._needMap.set(task.taskId, task.need);
            }
        });
    },

    dump () {
        const tasks = [];
        for (let [taskId, state] of this._stateMap.entries()) {
            const task = {taskId, state};
            if (this._needMap.has(taskId)) {
                task.need = this._needMap.get(taskId);
            }
            tasks.push(task);
        }
        return tasks;
    },

    isTaskEnd (taskId) {
        return this._stateMap.get(taskId) == State.End;
    },

    getTaskState (taskId) {
        return this._stateMap.get(taskId) || State.New;
    },

    setTaskState (taskId, state) {
        this._stateMap.set(taskId, state);
        this.emit('task-state-changed', taskId, state);
    },

    setNeedItem (taskId, itemGid) {
        this._needMap.set(taskId, itemGid);
    },

    getRunningTasks () {
        const tasks = [];
        for (let [taskId, state] of this._stateMap.entries()) {
            if (state == State.Accepted || state == State.Finished) {
                tasks.push({taskId, state});
            }
        }
        return tasks;
    },

    hasRunningTask () {
        for (let [taskId, state] of this._stateMap.entries()) {
            if (state == State.Accepted || state == State.Finished) {
                return true;
            }
        }
        return false;
    },

    onGetItem (itemGid) {
        for (let [taskId, needGid] of this._needMap.entries()) {
            const state = this.getTaskState(taskId);
            if (itemGid == needGid && state == State.Accepted) {
                this.setTaskState(taskId, State.Finished);
                this._needMap.delete(taskId);
                break;
            }
        }
    },
});

TaskState.TaskState = State;
