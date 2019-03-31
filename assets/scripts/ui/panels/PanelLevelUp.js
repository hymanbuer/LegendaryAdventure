
cc.Class({
    extends: cc.Component,

    properties: {
        level: cc.Label,
        attack: cc.Label,
        defence: cc.Label,
        health: cc.Label,
    },

    run (info) {
        this.level.string = info.level.toString();
        this.attack.string = `:${info.attack}`;
        this.defence.string = `:${info.defence}`;
        this.health.string = `:${info.hp}`;
    },

    onClickConfirm () {
        this.node.destroy();
    },
});
