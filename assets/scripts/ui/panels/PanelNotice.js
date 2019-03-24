
cc.Class({
    extends: cc.Component,

    properties: {
        text: cc.Label,
    },

    run (text) {
        this.text.string = text;
    },

    onClick () {
        this.node.destroy();
    },

    onClickConfirm () {
        this.node.destroy();
    },
});
