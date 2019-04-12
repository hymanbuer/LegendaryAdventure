
const TalkType = require('PanelTalk').TalkType;
const TaskState = require('TaskState').TaskState;
const Game = require('Game');

cc.Class({
    extends: require('BaseEvent'),

    properties: {
    },

    onLoad () {
    },

    init (event) {
        this.event = event;
        this.title = event.NAME;
    },

    doBeforeEnter (sender, callback) {
        const state = Game.taskState.getTaskState(this.event.ID);
        if (state === TaskState.New) {
            if (this.event.TASKNEEDED == null) {
                Game.openPanel('talk', this.title, this.event.TASK, TalkType.Normal);
                Game.onPanelClosed('talk', () => {
                    this._doTaskEnd(callback);
                });
            } 
            else {
                if (Game.bag.hasItem(this.event.TASKNEEDED)) {
                    this._doTaskEnd(callback);
                } else {
                    callback(`Task accepted: ${this.event.ID}`);
                    Game.taskState.setTaskState(this.event.ID, TaskState.Accepted);
                    Game.taskState.setNeedItem(this.event.ID, this.event.TASKNEEDED);
                    Game.openPanel('talk', this.title, this.event.TASK, TalkType.Task);
                }
            }
        } 
        else if (state === TaskState.Accepted) {
            callback(`Task proccessing: ${this.event.ID}`);
            Game.openPanel('talk', this.title, this.event.TASKING, TalkType.Normal);
        } 
        else if (state === TaskState.Finished) {
            this._doTaskEnd(callback);
        } 
        else {
            callback(null);
            if (this.event.TASKOVER) {
                Game.openPanel('talk', this.title, this.event.TASKOVER, TalkType.Normal);
            }
        }
    },

    _doTaskEnd (callback) {
        Game.taskState.setTaskState(this.event.ID, TaskState.End);
        if (this.event.TASKNEEDED) {
            Game.bag.reduceItem(this.event.TASKNEEDED);
        }
        if (Game.config.isPrincess(this.gid)) {
            Game.profile.savedPrincess[this.gid] = true;
        }

        const checkTaskBlack = () => {
            callback(null);
            if (this.event.TASKBLACK) {
                Game.openPanel('quest_complete', this.event.TASKBLACK);
                Game.mapState.removeEntity(this.floorId, this.grid);
                this.node.destroy();
            }
        };
        if (this.event.TASKEND) {
            Game.openPanel('talk', this.title, this.event.TASKEND, TalkType.Normal);
            Game.onPanelClosed('talk', checkTaskBlack);
        } else {
            checkTaskBlack();
        }
    },
});
