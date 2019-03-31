
cc.Class({
    extends: cc.Component,

    properties: {
    },

    run (params) {
        params = params || {
            confirmHandler: null,
            cancelHandler: null,
        };
        this.cancelHandler = params.cancelHandler;
        this.confirmHandler = params.confirmHandler;
    },

    onClickConfirm () {
        if (typeof this.confirmHandler == 'function') {
            this.confirmHandler.call();
        }
        this.node.destroy();
    },

    onClickCancel () {
        if (typeof this.cancelHandler == 'function') {
            this.cancelHandler.call();
        }
        this.node.destroy();
    },
});
