
cc.Class({
    extends: cc.Component,

    properties: {
        exp: cc.Label,
        gold: cc.Label,
    },

    run (info) {
        this.exp.string = `:${info.exp}`;
        this.gold.string = `:${info.gold}`;
    },

    onClickConfirm () {
        this.node.destroy();
    },
});
