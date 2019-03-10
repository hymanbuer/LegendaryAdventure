
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onClickClose () {
        this.node.destroy();
    },

    onClickConfirm () {
        this.node.destroy();
    },
});
