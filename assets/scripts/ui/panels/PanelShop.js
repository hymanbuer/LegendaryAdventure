
const Game = require('Game');
const GameSetting = require('GameSetting');

// 151, 152, 153, 154, 2002
const shopItemConfigs = [
    {
        type: 0,
        gid: 151,
        basePrice: 50,
        priceStep: 1,
        maxPrice: 250,
    },
    {
        type: 1,
        gid: 152,
        basePrice: 200,
        priceStep: 1,
        maxPrice: 500,
    },
    {
        type: 2,
        gid: 153,
        basePrice: 100,
        priceStep: 1,
        maxPrice: 200,
    },
    {
        type: 3,
        gid: 154,
        basePrice: 100,
        priceStep: 1,
        maxPrice: 200,
    },
    {
        type: 4,
        gid: 2002,
        basePrice: 150,
        priceStep: 5,
        maxPrice: 800,
    },
];

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
        prices: [cc.Label],
    },

    onLoad () {
        this._updateCoins();
        this._updateDoubleWidgets();
        this._updatePrices();
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
            this._noticeCount = this._noticeCount == null ? 0 : this._noticeCount;
            this._noticeCount += 1;
            if (this._noticeCount > 3) {
                Game.openPanel('notice', '好吧，既然你要坚持，那就给你加一点金币吧！');
                Game.bag.plusCoins(2000);
                this._updateCoins();
            } else {
                Game.openPanel('notice', '为了更好的游戏体验，暂不开放该功能~');
            }
        }
    },

    _doBuyItem (type) {
        let price = this._getPriceByType(type);
        if (price > Game.bag.getNumOfCoins()) {
            Game.openPanel('notice', '金币不足!');
        } else {
            const config = shopItemConfigs[type];
            Game.bag.minusCoins(price);
            Game.bag.addItem(config.gid);

            this._updateCoins();
            if (price < config.maxPrice) {
                price += config.priceStep;
                Game.profile.shop[config.gid] = price;
                Game.profile.save();
                this._updatePrices();
            }
        }
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

    _updatePrices () {
        this.prices.forEach((price, type) => {
            price.string = this._getPriceByType(type); 
        });
    },

    _getPriceByType (type) {
        const config = shopItemConfigs[type];
        let price = Game.profile.shop[config.gid];
        if (price == null) {
            price = config.basePrice;
        }
        return price;
    },
});
