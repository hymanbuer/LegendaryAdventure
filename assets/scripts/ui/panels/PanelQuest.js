
const Game = require('Game');

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
        
    },

    onClickClose () {
        this.node.destroy();
    },

    _createQuest (title, detail) {

    },
});
