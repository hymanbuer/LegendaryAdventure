

cc.Class({
    extends: cc.Component,

    properties: {
        monster: cc.Sprite,
        miss: cc.Sprite,
        playerAttackNumber: cc.Label,
        monsterAttackNumber: cc.Label,
        redBarLeft: cc.Sprite,
        redBarRight: cc.Sprite,
        monsterAttackSign: cc.Sprite,
    },

    onLoad () {
        this._showPlayerMiss()
            .then(() => this._showMonsterAttack(48));
    },

    onClickAutoPlay () {
        this._showPlayerMiss()
            .then(() => this._showMonsterAttack(48));
    },

    _showPlayerMiss () {
        return new Promise(resolve => {
            const delta = 16;
            cc.tween(this.monster.node)
                .by(3/30, {x: delta})
                .by(3/30, {x: -delta})
                .by(3/30, {y: delta})
                .by(3/30, {y: -delta})
                .by(3/30, {x: -delta, y: delta})
                .by(2/30, {x: delta})
                .by(2/30, {y: -delta})
                .call(resolve)
                .start();
    
            this.miss.node.active = true;
            this.miss.node.opacity = 255;
            this.miss.node.y = 18;
            cc.tween(this.miss.node)
                .show()
                .to(12/30, {y: 158})
                .delay(3/30)
                .to(4/30, {opacity: 0})
                .hide()
                .start();
        });
    },

    _showMonsterAttack (num) {
        const showMonsterAttackNumber = callback => {
            this.monsterAttackNumber.node.active = true;
            this.monsterAttackNumber.string = `:${num}`;
            this.monsterAttackNumber.node.y = 98;
            this.monsterAttackNumber.node.opacity = 255;
            cc.tween(this.monsterAttackNumber.node)
                .show()
                .to(20/30, {y: -102})
                .delay(4/30)
                .to(8/30, {opacity: 0})
                .hide()
                .call(callback)
                .start();
        };
        const showShakeEffect = () => {
            this.redBarLeft.node.active = true;
            this.redBarRight.node.active = true;
            this.monsterAttackSign.node.active = true;

            cc.tween(this.redBarLeft.node)
                .then(cc.blink(0.5, 2))
                .start()
            cc.tween(this.redBarRight.node)
                .then(cc.blink(0.5, 2))
                .call(() => {
                    this.redBarLeft.node.active = false;
                    this.redBarRight.node.active = false;
                    this.monsterAttackSign.node.active = false;
                })
                .start();
        };

        return new Promise(resolve => {
            cc.tween(this.monster.node)
                .by(3/30, {scale: -0.1})
                .by(3/30, {scale: 0.1})
                .call(() => {
                    this.node.emit('monster-attack', num);
                    showShakeEffect();
                    showMonsterAttackNumber(resolve)
                })
                .start();
        });
    },

});
