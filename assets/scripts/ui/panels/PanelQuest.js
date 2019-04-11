
const Game = require('Game');
const TaskState = require('TaskState').TaskState;

cc.Class({
    extends: cc.Component,

    properties: {
        container: cc.Node,
        template: cc.Node,
    },

    start () {
        this.template.active = false;
        this.container.removeAllChildren();

        const tasks = Game.taskState.getRunningTasks();
        for (let task of tasks) {
            const info = Game.data.getTask(task.taskId);
            if (info == null) {
                continue;
            }

            let title = info.name;
            let detail = '';
            if (task.state == TaskState.Accepted) {
                detail = info.runningMessage;
            } else if (task.state == TaskState.Finished) {
                detail = info.finishedMessage;
            }
            const quest = this._createQuest(title, detail);
            this.container.addChild(quest);
        }

        if (this.container.children.length == 0) {
            this.node.destroy();
        }
    },

    onClickClose () {
        this.node.destroy();
    },

    _createQuest (title, detail) {
        const quest = cc.instantiate(this.template);
        cc.find('title', quest).getComponent(cc.Label).string = title;
        cc.find('detail', quest).getComponent(cc.Label).string = detail;
        quest.active = true;
        return quest;
    },
});
