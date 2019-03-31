
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        coins: cc.Label,
        title: cc.Sprite,
        icon: cc.Sprite,
        stones: [cc.Sprite],
        property: cc.Sprite,
        base: cc.Label,
        add: cc.Label,
        level: cc.Label,
        cost: cc.Label,
        progressBar: cc.ProgressBar,
    },

    run (isSword) {
        this.coins.string = Game.bag.getNumOfCoins().toString();

        const equip = isSword ? Game.player.getSword() : Game.player.getShield();
        this.property.spriteFrame = Game.res.getPropertySpriteFrameType(isSword);
        this.title.spriteFrame = Game.res.getEquipNameSpriteFrameByGid(equip.gid);
        this.icon.spriteFrame = Game.res.getItemSpriteFrameByGid(equip.gid);
        this.stones.forEach((stone, i) => {
            stone.node.active = i < equip.stones.length;
            if (i < equip.stones.length) {
                stone.spriteFrame = Game.res.getItemSpriteFrameByGid(equip.stones[i]);
            }
        });

        this._isSword = isSword;
        this._equip = equip;
        this._updateEnhance();
    },

    onClickClose () {
        this.node.destroy();
    },

    onClickEnhance () {
        if (this._equip.enhance.level < this._equip.enhance.limit) {
            const cost = this._getCost();
            if (cost <= Game.bag.getNumOfCoins()) {
                this.coins.string = Game.bag.minusCoins(cost).toString();
                this._enhance();
            } else {
                Game.openPanel('notice', '金币不足。');
            }
        } else {
            Game.openPanel('notice', '已经升级到最高级，无法继续强化。');
        }
    },

    onClickStone () {
        if (this._isSword) {
            Game.openPanel('notice', '集齐六颗灵石，可以找塞尔达公主升级您的武器。');
        } else {
            Game.openPanel('notice', '集齐六颗符石，可以找塞尔达公主升级您的盾牌。');
        }
    },

    onClickPlus () {
        Game.openPanel('shop', true);
    },

    _enhance () {
        if (this._isSword) {
            Game.player.enhanceSword();
        } else {
            Game.player.enhanceShield();
        }
        this._equip = this._isSword ? Game.player.getSword() : Game.player.getShield();
        this._updateEnhance();
    },

    _updateEnhance () {
        const equip = this._equip;
        const base = this._isSword ? Game.player.getBaseAttack() : Game.player.getBaseDefence();
        this.base.string = base.toString();
        this.add.string = `:${equip.enhance.level * equip.enhance.step}`;
        this.level.string = `${equip.enhance.level}:${equip.enhance.limit}`;
        this.progressBar.progress = equip.enhance.level / equip.enhance.limit;
        this.cost.string = this._getCost().toString();
    },

    _getCost () {
        const enhance = this._equip.enhance;
        return enhance.cost + enhance.costStep * enhance.level;
    },
});
