
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
                    callback(null);
                    Game.taskState.setTaskState(this.event.ID, TaskState.End);
                });
            } 
            else {
                if (Game.bag.hasItem(this.event.TASKNEEDED)) {
                    callback(`Task finished: ${this.event.ID}`);
                    Game.taskState.setTaskState(this.event.ID, TaskState.Finished);
                } else {
                    callback(`Task accepted: ${this.event.ID}`);
                    Game.taskState.setTaskState(this.event.ID, TaskState.Accepted);
                    Game.taskState.setNeedItem(this.event.ID, this.event.TASKNEEDED);
                }
                Game.openPanel('talk', this.title, this.event.TASK, TalkType.Task);
            }
        } 
        else if (state === TaskState.Accepted) {
            callback(`Task proccessing: ${this.event.ID}`);
            Game.openPanel('talk', this.title, this.event.TASKING, TalkType.Normal);
        } 
        else if (state === TaskState.Finished) {
            Game.taskState.setTaskState(this.event.ID, TaskState.End);
            Game.openPanel('talk', this.title, this.event.TASKEND, TalkType.Normal);
            Game.onPanelClosed('talk', () => {
                callback(null);
                Game.mapState.removeEntity(this.floorId, this.grid);
                Game.profile.savedPrincess[this.gid] = true;
                this.node.destroy();
                Game.openPanel('quest_complete', this.event.TASKBLACK);
            });
        } else {
            callback(null);
        }
    },
});
