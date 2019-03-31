
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        coins: cc.Label,
    },

    run () {
        this.coins.string = Game.bag.getNumOfCoins().toString();
    },

    onClickClose () {
        this.node.destroy();
    },
});
