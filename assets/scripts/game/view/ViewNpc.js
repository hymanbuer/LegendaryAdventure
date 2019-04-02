

const Game = require('Game');
const Utils = require('Utils')
const TaskState = require('TaskState').TaskState;

cc.Class({
    extends: require('BaseView'),

    properties: {
        body: cc.Sprite,
        shadow: cc.Sprite,
        bubble: cc.Node,
    },

    onLoad () {
        Game.taskState.on('task-state-changed', this.onTaskStateChanged, this);
        this.bubble.active = false;
        this._bubbleOffset = cc.v2(this.bubble.position);
    },

    onDestroy () {
        Game.taskState.off('task-state-changed', this.onTaskStateChanged, this);
        this.hideBubble();
    },

    start () {
        if (Game.data.getTask(this.gid) != null
            && Game.taskState.getTaskState(this.gid) == TaskState.New) {
            this.showBubble(this.gid == 9 ? '勇者!' : '救命!');
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
        const cloneBubble = cc.instantiate(this.bubble);
        const worldPos = this.node.convertToWorldSpaceAR(this._bubbleOffset);
        const position = this.node.parent.convertToNodeSpaceAR(worldPos);
        cloneBubble.parent = this.node.parent;
        cloneBubble.position = position;
        cloneBubble.zIndex = this.node.zIndex + 1;
        cloneBubble.active = true;

        const label = cloneBubble.getComponentInChildren(cc.Label);
        if (label) {
            label.string = text;
        }

        cloneBubble.setScale(0);
        cc.tween(cloneBubble)
            .to(0.25, {scaleX: 1, scaleY: 1})
            .delay(1.0)
            .to(0.25, {scaleX: 0, scaleY: 0})
            .delay(1.2)
            .repeatForever()
            .start();

        this.cloneBubble = cloneBubble;
    },

    hideBubble () {
        if (cc.isValid(this.cloneBubble)) {
            this.cloneBubble.destroy();
        }
    },

    onTaskStateChanged (taskId, state) {
        if (taskId == this.gid && state != TaskState.New) {
            this.hideBubble();
        }
    },
});
