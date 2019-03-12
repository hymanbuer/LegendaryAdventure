
const Game = require('Game');

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

    run (floorId, gid) {
        const data = Game.dataCenter.getMonster(gid);
        this.title.string = data.NAME;
        this.text.string = data.MESSAGE;
        this.hp.string = data.HP;
        this.attack.string = data.ATT;
        this.defence.string = data.DEF;
        this.battle.spriteFrame = Game.res.getSmallBattleBg(floorId);
        this.monster.spriteFrame = Game.res.getSmallMonster(floorId, gid);
    },
    
    onClickClose () {
        this.node.destroy();
    },

    onClickGoFight () {
        this.node.destroy();
    },
});
