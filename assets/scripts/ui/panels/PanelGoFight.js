
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

    run (floorId, gid, grid) {
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

        this.monsterStatus = {
            grid: grid,
            floorId: floorId,
            gid: gid,
            name: data.NAME,
            message: data.MESSAGE,
            hp: data.HP,
            maxHp: data.HP,
            attack: data.ATT,
            defence: data.DEF,
            criticalPos: data.CRITPOS,
            criticalLength: data.CRITLENGHT,
            cursorMoveDuration: data.TIMING,
    
            exp: data.EXP,
            gold: data.GOLD,
            item: data.WUPIN,
        };
    },
    
    onClickClose () {
        this.node.destroy();
    },

    onClickGoFight () {
        const event = new cc.Event.EventCustom('enter-battle-field', true);
        event.detail = this.monsterStatus;
        this.node.dispatchEvent(event);
        this.node.destroy();

    },
});
