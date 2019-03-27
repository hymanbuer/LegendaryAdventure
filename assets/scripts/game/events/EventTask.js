
const TalkType = require('PanelTalk').TalkType;
const TaskState = require('TaskState').TaskState;
const Game = require('Game');

function showTalk(title, talkList, type, callback) {
    Game.openPanel('talk', title, talkList, type);
    // Game.onPanelClosed('talk', () => callback(null));
}

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
            Game.taskState.setTaskState(this.event.ID, TaskState.Accepted);
            Game.taskState.setNeedItem(this.event.ID, this.event.TASKNEEDED);
            callback(`Task accepted: ${this.event.ID}`);
            showTalk(this.title, this.event.TASK, TalkType.Task);
        } 
        else if (state === TaskState.Accepted) {
            callback(`Task proccessing: ${this.event.ID}`);
            showTalk(this.title, this.event.TASKING, TalkType.Normal);
        } 
        else if (state === TaskState.Finished) {
            Game.taskState.setTaskState(this.event.ID, TaskState.End);
            callback(null);
            showTalk(this.title, this.event.TASKEND, TalkType.Normal);

            Game.mapState.removeEntity(this.floorId, this.grid);
            this.node.destroy();
        }
    },
});
