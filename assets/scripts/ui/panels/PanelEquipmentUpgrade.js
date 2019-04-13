
const Game = require('Game');

const Equipment = cc.Class({
    name: 'Equipment',
    properties: {
        title: cc.Label,
        icon: cc.Sprite,
        stones: [cc.Sprite],
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        sword: Equipment,
        shield: Equipment,
    },

    run () {
        this._updateView(true);
        this._updateView(false);
    },

    onClickClose () {
        this.node.destroy();
    },

    onClickUpgradeSword () {
        const equip = Game.player.getSword();
        if (equip.stones.length < 6) {
            Game.openPanel('notice', '灵石不足，无法升级您的武器！');
        } else {
            const newSwordGid = equip.gid + 1;
            Game.bag.addItem(newSwordGid);
            Game.bag.reduceItem(equip.gid);
            this._updateView(true);
        }
    },

    onClickUpgradeShield () {
        const equip = Game.player.getShield();
        if (equip.stones.length < 6) {
            Game.openPanel('notice', '符石不足，无法升级您的盾牌！');
        } else {
            const newShieldGid = equip.gid + 1;
            Game.bag.addItem(newShieldGid);
            Game.bag.reduceItem(equip.gid);
            this._updateView(false);
        }
    },

    _updateView (isSword) {
        const info = isSword ? Game.player.getSword() : Game.player.getShield();
        const equip = isSword ? this.sword : this.shield;
        equip.title.string = Game.data.getItemInfo(info.gid).NAME;
        equip.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(info.gid);
        equip.stones.forEach((stone, i) => {
            stone.node.active = i < info.stones.length;
            if (i < info.stones.length) {
                stone.spriteFrame = Game.res.getItemSpriteFrameByGid(info.stones[i]);
            }
        });
    },
});
