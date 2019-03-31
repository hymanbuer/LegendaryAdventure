
const Game = require('Game');
const GameSetting = require('GameSetting');

cc.Class({
    extends: cc.Component,

    properties: {
        goldShop: cc.Node,
        itemShop: cc.Node,
        btnGoldShop: cc.Node,

        tickDoubleExp: cc.Node,
        tickDoubleGold: cc.Node,
        buyDoubleExp: cc.Node,
        buyDoubleGold: cc.Node,

        coins: cc.Label,
    },

    onLoad () {
        this._updateCoins();
        this._updateDoubleWidgets();
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

    onClickBuy (_, custom) {
        cc.log('buy', custom);
        const type = Number(custom);
        if (type >= 0 && type <= 4) {
            this._doBuyItem(type);
        } else if (type == 5) {
            GameSetting.isDoubleExp = true;
            GameSetting.save();
            this._updateDoubleWidgets();
        } else if (type == 6) {
            GameSetting.isDoubleGold = true;
            GameSetting.save();
            this._updateDoubleWidgets();
        } else {
            Game.openPanel('notice', '为了更好的游戏体验，暂不开放该功能~');
        }
    },

    _doBuyItem (type) {
        
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

    _updateCoins () {
        this.coins.string = Game.bag.getNumOfCoins().toString();
    },

    _updateDoubleWidgets () {
        this.tickDoubleExp.active = GameSetting.isDoubleExp;
        this.tickDoubleGold.active = GameSetting.isDoubleGold;
        this.buyDoubleExp.active = !GameSetting.isDoubleExp;
        this.buyDoubleGold.active = !GameSetting.isDoubleGold;
    },
});
