
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        coins: cc.Label,
        level: cc.Label,
        exp: cc.Label,
        hp: cc.Label,
        attack: cc.Label,
        defence: cc.Label,
        expBar: cc.ProgressBar,
        hpBar: cc.ProgressBar,
        items: cc.Node,
    },

    onEnable () {
        Game.bag.on('coins-changed', this.updateCoins, this);
        Game.player.on('player-attack-changed', this.updateAttack, this);
        Game.player.on('player-defence-changed', this.updateDefence, this);
    },

    onDisable () {
        Game.bag.off('coins-changed', this.updateCoins, this);
        Game.player.off('player-attack-changed', this.updateAttack, this);
        Game.player.off('player-defence-changed', this.updateDefence, this);
    },

    run () {
        const player = Game.player;
        this.coins.string = Game.bag.getNumOfCoins().toString();
        this.level.string = player.level;
        this.exp.string = `${player.exp}:${player.nextExp}`;
        this.hp.string = `${player.hp}:${player.maxHp}`;
        this.attack.string = player.attack;
        this.defence.string = player.defence;
        this.expBar.progress = player.exp / player.nextExp;
        this.hpBar.progress = player.hp / player.maxHp;
    },

    onClickClose () {
        this.node.destroy();
    },

    onClickPlusAttack () {
        if (Game.player.hasSword()) {
            Game.openPanel('equipment', true);
        } else {
            Game.openPanel('notice', '您还没有获得武器!');
        }
    },

    onClickPlusDefence () {
        if (Game.player.hasShield()) {
            Game.openPanel('equipment', false);
        } else {
            Game.openPanel('notice', '您还没有获得盾牌!');
        }
    },

    onClickPlusGold () {
        Game.openPanel('shop', true);
    },

    updateCoins () {
        this.coins.string = Game.bag.getNumOfCoins().toString();
    },

    updateAttack () {
        this.attack.string = Game.player.attack;
    },

    updateDefence () {
        this.defence.string = Game.player.defence;
    },
});
