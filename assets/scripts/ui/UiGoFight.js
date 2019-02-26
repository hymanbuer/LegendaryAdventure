
const DataCenter = require('DataCenter');
const Resources = require('Resources');

cc.Class({
    extends: cc.Component,

    properties: {
        battle: cc.Sprite,
        monster: cc.Sprite,
        hp: cc.Label,
        attack: cc.Label,
        defence: cc.Label,
        text: cc.Label,
        title: cc.Label,
    },

    init (floorId, gid) {
        const data = DataCenter.instance.getMonster(gid);
        this.title.string = data.NAME;
        this.text.string = data.MESSAGE;
        this.hp.string = data.HP;
        this.attack.string = data.ATT;
        this.defence.string = data.DEF;
        this.battle.spriteFrame = Resources.instance.getSmallBattleBg(floorId);
        this.monster.spriteFrame = Resources.instance.getSmallMonster(floorId, gid);
    },

    onClickClose () {
        this.node.destroy();
    },

    onClickGoFight () {
        this.node.destroy();
    },
});
