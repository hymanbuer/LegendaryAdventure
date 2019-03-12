
cc.Class({
    extends: cc.Component,

    properties: {
        text: cc.Label,
        icon: cc.Sprite,
    },

    run (useMethod, text, icon) {
        this.useMethod = useMethod;
        this.text.string = text;
        this.icon.spriteFrame = icon;
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
