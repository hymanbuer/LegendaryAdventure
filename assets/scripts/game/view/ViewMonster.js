

const Game = require('Game');
const Utils = require('Utils')

cc.Class({
    extends: require('BaseView'),

    properties: {
        body: cc.Sprite,
        feet: cc.Sprite,
        shadow: cc.Sprite,
    },

    init (gid) {
        const monster = Game.res.getSmallMonster(this.floorId, gid);
        this.body.spriteFrame = monster.body;
        this.feet.spriteFrame = monster.feet;
        if (monster.bodyClip) {
            const animation = this.body.addComponent(cc.Animation);
            animation.addClip(monster.bodyClip);
            animation.play(monster.bodyClip.name);
        } else {
            this.getComponent(cc.Animation).play();
        }
    },
});
