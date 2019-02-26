
cc.Class({
    extends: cc.Component,

    properties: {
        text: cc.Label,
    },

    onClick () {
        this.node.destroy();
    },

    onClickConfirm () {
        this.node.destroy();
    },
});
