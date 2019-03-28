

const Game = require('Game');
const Utils = require('Utils')
const TaskState = require('TaskState').TaskState;

cc.Class({
    extends: require('BaseView'),

    properties: {
        body: cc.Sprite,
        shadow: cc.Sprite,
        bubble: cc.Node,
        bubbleText: cc.Label,
    },

    onLoad () {
        this.bubble.active = false;
        Game.taskState.on('task-state-changed', this.onTaskStateChanged, this);
    },

    onDestroy () {
        Game.taskState.off('task-state-changed', this.onTaskStateChanged, this);
    },

    start () {
        if (Game.data.getTask(this.gid) != null
            && Game.taskState.getTaskState(this.gid) == TaskState.New) {
            this.showBubble('救命!');
        }
    },

    init (gid) {
        const id = Utils.fixedNumber(gid, 2);
        const clipName = `PR_${id}_1`;
        const isPrincess = Game.config.isPrincess(gid);
        if (isPrincess && Game.animation.hasClipConfig(clipName)) {
            const bodyClip = Game.animation.getClip(clipName, cc.WrapMode.Loop);
            const animation = this.body.addComponent(cc.Animation);
            animation.addClip(bodyClip);
            animation.play(bodyClip.name);
        } else {
            const bodyName = isPrincess ? `P_${id}_1` : `P_${id}`;
            this.body.spriteFrame = Game.res.getItemSpriteFrame(bodyName);
            this.getComponent(cc.Animation).play();
        }
    },

    showBubble (text) {
        this.bubble.active = true;
        this.bubbleText.string = text;
        this.getComponent(cc.Animation).play('bubble_scale');
    },

    hideBubble () {
        this.bubble.active = false;
    },

    onTaskStateChanged (taskId, state) {
        if (taskId == this.gid && state != TaskState.New) {
            this.hideBubble();
        }
    },
});
