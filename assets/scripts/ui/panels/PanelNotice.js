
cc.Class({
    extends: cc.Component,

    properties: {
        text: cc.Label,
        longConfirm: cc.Node,
        shortConfirm: cc.Node,
        cancel: cc.Node,
    },

    run (text, params) {
        params = params || {
            hasCancel: false,
            target: null,
            confirmHandler: null,
            cancelHandler: null,
        };

        this.text.string = text;
        this.longConfirm.active = !params.hasCancel;
        this.shortConfirm.active = params.hasCancel;
        this.cancel.active = params.hasCancel;
        this.confirmHandler = params.confirmHandler;
        this.cancelHandler = params.cancelHandler;
        this.handleTarget = params.target;
    },

    onClickConfirm () {
        if (typeof this.confirmHandler == 'function') {
            this.confirmHandler.call(this.handleTarget);
        }
        this.node.destroy();
    },

    onClickCancel () {
        if (typeof this.cancelHandler == 'function') {
            this.cancelHandler.call(this.handleTarget);
        }
        this.node.destroy();
    },
});
