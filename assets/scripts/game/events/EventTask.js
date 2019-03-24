
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
        this.state = Game.taskState.getTaskState(event.ID);
    },

    doBeforeEnter (sender, callback) {
        if (this.state === TaskState.New) {
            this.state = TaskState.Accepted;
            Game.taskState.setTaskState(this.event.ID, TaskState.Accepted);
            callback(`Task accepted: ${this.event.ID}`);
            showTalk(this.title, this.event.TASK, TalkType.Task);
        } else if (this.state === TaskState.Accepted) {
            if (Game.bag.getNumOfItem(this.event.TASKNEEDED) > 0) {
                this.state = TaskState.Finished;
                Game.taskState.setTaskState(this.event.ID, TaskState.Finished);

                Game.mapState.removeEntity(this.floorId, this.grid);
                this.node.destroy();

                callback(null);
                showTalk(this.title, this.event.TASKEND, TalkType.Normal);
            } else {
                callback(`Task proccessing: ${this.event.ID}`);
                showTalk(this.title, this.event.TASKING, TalkType.Normal);
            }
        }
    },
});
