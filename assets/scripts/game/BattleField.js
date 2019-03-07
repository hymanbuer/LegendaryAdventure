

const AttackType = cc.Enum({
    PLAYER_CRITICAL_ATTACK: 'baoji',
    PLAYER_ATTACK: 'dj',
    MONSTER_ATTACK: 'zh',
});

cc.Class({
    extends: cc.Component,

    properties: {
        monster: cc.Sprite,
        playerAttackNumber: cc.Label,
        monsterAttackNumber: cc.Label,
        redBarLeft: cc.Sprite,
        redBarRight: cc.Sprite,
        attackSign: cc.Sprite,
        specialSign: cc.Sprite,
        spriteAtlas: cc.SpriteAtlas,
    },

    onLoad () {
        this._initCriticalSignAnimation();
    },

    _initCriticalSignAnimation () {
        const frames = [];
        for (let i = 1; i <= 6; ++i) {
            const frame = this.spriteAtlas.getSpriteFrame(`b${i}`);
            frames.push(frame);
        }
        const clip = cc.AnimationClip.createWithSpriteFrames(frames, 10);
        clip.name = 'critical';
        clip.wrapMode = cc.WrapMode.Normal;

        const animation = this.attackSign.addComponent(cc.Animation);
        animation.addClip(clip);
    },

    onClickAutoPlay (sender) {
        if (sender.isChecked) {
            this.showPlayerCriticalAttack(36)
                .then(() => this.showMonsterAttack(48));
        } else {
            this.showPlayerMiss()
                .then(() => this.showMonsterMiss());
        }
    },

    showPlayerMiss () {
        this.node.emit('player-miss');
        this._showMonsterDodge();
        return this._showPlayerMissSign();
    },

    showMonsterMiss () {
        this.node.emit('monster-miss');
        this._showMonsterAttack();
        return this._showMonsterMissSign();
    },

    showPlayerNormalAttack (num) {
        this.node.emit('player-attack', num);
        this._showMonsterHurt();
        this._showNormalAttackSign(AttackType.PLAYER_ATTACK);
        return this._showPlayerAttackNumber(num);
    },

    showPlayerCriticalAttack (num) {
        this.node.emit('player-attack', num);
        this._showMonsterHurt();
        this._showCriticalAttackSign();
        this._showCriticalSign();
        return this._showPlayerAttackNumber(num);
    },

    showMonsterAttack (num) {
        return this._showMonsterAttack().then(() => {
            this.node.emit('monster-attack', num);
            this._showShakeEffect();
            this._showNormalAttackSign(AttackType.MONSTER_ATTACK);
            return this._showMonsterAttackNumber(num);
        });
    },

    _showMonsterAttack () {
        return new Promise(resolve => {
            cc.tween(this.monster.node)
                .by(3/30, {scale: -0.1})
                .call(resolve)
                .by(3/30, {scale: 0.1})
                .start();
        });
    },

    _showMonsterHurt () {
        return new Promise(resolve => {
            this.monster.node.color = cc.color(236, 57, 57);
            cc.tween(this.monster.node)
                .by(4/30, {x: -16})
                .by(4/30, {x: 16})
                .then(cc.tintTo(4/30, 255, 255, 255))
                .call(resolve)
                .start();
        });
    },

    _showMonsterDodge () {
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
        });
    },

    _showNormalAttackSign (attackType) {
        return new Promise(resolve => {
            const sign = this.spriteAtlas.getSpriteFrame(attackType);
            this.attackSign.spriteFrame = sign;
            this.attackSign.node.active = true;
            this.attackSign.node.opacity = 255;
            cc.tween(this.attackSign.node)
                .delay(8/30)
                .to(4/30, {opacity: 0})
                .call(resolve)
                .start();
        });
    },

    _showCriticalAttackSign () {
        return new Promise(resolve => {
            const animation = this.attackSign.getComponent(cc.Animation);
            const state = animation.play('critical');
            this.attackSign.node.active = true;
            this.attackSign.node.opacity = 255;
            state.on('finished', () => {
                cc.tween(this.attackSign.node)
                    .to(4/30, {opacity: 0})
                    .call(resolve)
                    .start();
            });
        });
    },

    _showShakeEffect () {
        return new Promise(resolve => {
            this.redBarLeft.node.active = true;
            this.redBarRight.node.active = true;
            const left = cc.tween(this.redBarLeft.node)
                .show()
                .then(cc.blink(0.5, 2))
                .hide();
            const right = left.clone(this.redBarRight.node);
            left.start();
            right.call(resolve).start();
        });
    },

    _showMonsterAttackNumber (num) {
        return this._showAttackNumber(this.monsterAttackNumber, -200, num);
    },

    _showPlayerAttackNumber (num) {
        return this._showAttackNumber(this.playerAttackNumber, 200, num);
    },

    _showAttackNumber (label, deltaY, num) {
        return new Promise(resolve => {
            const originY = label.node.y;
            label.node.active = true;
            label.string = `:${num}`;
            label.node.opacity = 255;
            cc.tween(label.node)
                .show()
                .by(20/30, {y: deltaY})
                .delay(4/30)
                .to(8/30, {opacity: 0})
                .hide()
                .call(() => label.node.y = originY)
                .call(resolve)
                .start();
        });
    },

    _showPlayerMissSign () {
        const sign = this.spriteAtlas.getSpriteFrame('Miss');
        return this._showSpecialSign(sign, 148);
    },

    _showMonsterMissSign () {
        const sign = this.spriteAtlas.getSpriteFrame('Miss');
        return this._showSpecialSign(sign, -148);
    },

    _showCriticalSign () {
        const sign = this.spriteAtlas.getSpriteFrame('Critical');
        return this._showSpecialSign(sign, 148);
    },

    _showSpecialSign (sign, deltaY) {
        return new Promise(resolve => {
            const originY = this.specialSign.node.y;
            this.specialSign.spriteFrame = sign;
            this.specialSign.node.active = true;
            this.specialSign.node.opacity = 255;
            cc.tween(this.specialSign.node)
                .show()
                .by(12/30, {y: deltaY})
                .delay(3/30)
                .to(4/30, {opacity: 0})
                .hide()
                .call(() => this.specialSign.node.y = originY)
                .call(resolve)
                .start();
        });
    },

});
