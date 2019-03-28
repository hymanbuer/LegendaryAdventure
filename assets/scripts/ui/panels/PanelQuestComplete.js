
cc.Class({
    extends: cc.Component,

    properties: {
        text: cc.Label,
    },

    run (text) {
        this.text.string = text;
    },

    onClickConfirm () {
        this.node.destroy();
    },
});
