
const Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        battle: cc.Sprite,
        body: cc.Sprite,
        feet: cc.Sprite,
        hp: cc.Label,
        attack: cc.Label,
        defence: cc.Label,
        text: cc.Label,
        title: cc.Label,
    },

    run (floorId, gid) {
        const data = Game.data.getMonster(gid);
        this.title.string = data.NAME;
        this.text.string = data.MESSAGE;
        this.hp.string = data.HP;
        this.attack.string = data.ATT;
        this.defence.string = data.DEF;
        
        const monster = Game.res.getSmallMonster(floorId, gid);
        this.body.spriteFrame = monster.body;
        this.feet.spriteFrame = monster.feet;
        this.battle.spriteFrame = Game.res.getSmallBattleBg(floorId);
    },
    
    onClickClose () {
        this.node.destroy();
    },

    onClickGoFight () {
        this.node.destroy();
    },
});
