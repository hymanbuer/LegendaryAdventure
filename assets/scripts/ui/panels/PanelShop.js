
cc.Class({
    extends: cc.Component,

    properties: {
        goldShop: cc.Node,
        itemShop: cc.Node,
        btnGoldShop: cc.Node,
    },

    run (isOnlyGoldShop) {
        this._isOnlyGoldShop = isOnlyGoldShop;
        if (isOnlyGoldShop) {
            this._switchToGoldShop();
        } else {
            this._switchToItemShop();
        }
    },

    onClickClose () {
        if (this._isInGoldShop) {
            if (this._isOnlyGoldShop) {
                this.node.destroy();
            } else {
                this._switchToItemShop();
            }
        } else {
            this.node.destroy();
        }
    },

    onClickGoldShop () {
        this._switchToGoldShop();
    },

    _switchToGoldShop () {
        this._isInGoldShop = true;
        this.goldShop.active = true;
        this.itemShop.active = false;
        this.btnGoldShop.active = false;
    },

    _switchToItemShop () {
        this._isInGoldShop = false;
        this.goldShop.active = false;
        this.itemShop.active = true;
        this.btnGoldShop.active = true;
    },
});
