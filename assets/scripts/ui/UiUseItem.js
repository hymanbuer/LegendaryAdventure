
const DataCenter = require('DataCenter');
const Resources = require('Resources');

cc.Class({
    extends: cc.Component,

    properties: {
        text: cc.Label,
        icon: cc.Sprite,
    },

    onClick () {
        this.node.destroy();
    },

    onClickConfirm () {
        if (this.useMethod) {
            this.useMethod();
        }
        this.node.destroy();
    },

    onClickCancel () {
        this.node.destroy();
    },
});
