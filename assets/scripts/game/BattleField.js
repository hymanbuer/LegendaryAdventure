
const setting = require('GameSetting');

const AttackType = cc.Enum({
    PLAYER_CRITICAL_ATTACK: 'baoji',
    PLAYER_ATTACK: 'dj',
    MONSTER_ATTACK: 'zh',
});

const ROOT_BAR_WIDTH = 768;
const NORMAL_ATTACK_WIDTH = 480;
const CRITICAL_ATTACK_WIDTH = 56;

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

        autoPlayToggle: cc.Toggle,
        autoPlayTips: cc.Node,

        swordCursor: cc.Node,
        rootBar: cc.Node,
        normalAttackBar: cc.Node,
        criticalAttackBar: cc.Node,
    },

    onLoad () {
        this._initCriticalSignAnimation();
        this._initUi();
        this._addEventListeners();
    },

    onDestroy () {
        this._removeEventListeners();
    },

    start () {
        this.updateBattleData({
            CRITPOS: 7,
            CRITLENGHT: 1.2,
            TIMING: 1.0,
        });
    },

    onEnable () {
        this._totalAttackCount = 0;
        this._isAttackReady = true;
    },

    onDisable () {
        this._hideSwordCursor();
    },

    update (dt) {
        if (this._isAttackReady) {
            this._doNextTurn();
        }
    },

    updateBattleData (config) {
        this._criticalPos = config.CRITPOS;
        this._criticalLength = config.CRITLENGHT;
        this._cursorMoveDuration = config.TIMING;
        this._udpateAttackData();
    },

    onClickAutoPlay (sender) {
        setting.isAutoPlay = sender.isChecked;
        setting.save();
        this.autoPlayTips.active = setting.isAutoPlay;
    },

    //////////////////////////////////////////////////////////////////

    _initCriticalSignAnimation () {
        const frames = [];
        for (let i = 1; i <= 6; ++i) {
            const frame = this.spriteAtlas.getSpriteFrame(`b${i}`);
            frames.push(frame);
        }
        const clip = cc.AnimationClip.createWithSpriteFrames(frames, 12);
        clip.name = 'critical';
        clip.wrapMode = cc.WrapMode.Normal;

        const animation = this.attackSign.addComponent(cc.Animation);
        animation.addClip(clip);
    },

    _initUi () {
        this.autoPlayToggle.isChecked = setting.isAutoPlay;
        this.autoPlayTips.active = setting.isAutoPlay;
    },

    _addEventListeners () {
        this.rootBar.on(cc.Node.EventType.SIZE_CHANGED, this._udpateAttackData, this);
    },

    _removeEventListeners () {
        this.rootBar.off(cc.Node.EventType.SIZE_CHANGED, this._udpateAttackData, this);
    },

    _udpateAttackData () {
        if (!this._criticalPos || !this._criticalLength) {
            return;
        }
        const ratio = this.rootBar.width / ROOT_BAR_WIDTH;
        const normalBarX = ratio * CRITICAL_ATTACK_WIDTH * this._criticalPos;
        this.normalAttackBar.width = ratio * NORMAL_ATTACK_WIDTH;
        this.criticalAttackBar.width = ratio * CRITICAL_ATTACK_WIDTH * this._criticalLength;
        this.criticalAttackBar.x = -this.normalAttackBar.width/2.0 + normalBarX;
    },

    _doNextTurn () {
        if (this._isPlayerTurn()) {
            if (setting.isAutoPlay) {
                this._hideSwordCursor();
                this._doPlayerAttack();
            } else {
                this._showSwordCursor();
            }
        } else {
            this._doMonsterAttack();
        }
    },

    _isPlayerTurn () {
        return this._totalAttackCount % 2 == 0;
    },

    _doPlayerAttack () {
        this._isAttackReady = false;
        this._showPlayerNormalAttack(20)
            .then(() => this._completeAttack());
    },

    _doMonsterAttack () {
        this._isAttackReady = false;
        this._showMonsterAttack(24)
            .then(() => this._completeAttack());
    },

    _completeAttack () {
        this._isAttackReady = true;
        this._totalAttackCount += 1;
    },

    _showSwordCursor () {
        if (this.swordCursor.active) {
            return;
        }
        this.swordCursor.active = true;
        this.node.once('touchstart', this._touchStartHandler, this);

        const cursor = this.swordCursor;
        const parent = this.swordCursor.parent;
        const originX = parent.convertToNodeSpaceAR(cc.v2(0, 0)).x - cursor.width/2.0;
        const totalWidth = this.rootBar.width + cursor.width;
        cursor.x = originX;
        cc.tween(cursor)
            .by(this._cursorMoveDuration, {x: totalWidth})
            .to(0, {x: originX})
            .repeatForever()
            .start()
    },

    _hideSwordCursor () {
        if (!this.swordCursor.active) {
            return;
        }
        this.swordCursor.active = false;
        this._stopSwordCursor();
    },

    _stopSwordCursor () {
        this.node.off('touchstart', this._touchStartHandler, this);
        this.swordCursor.stopAllActions();
    },

    _touchStartHandler () {
        if (!this._isAttackReady) {
            return;
        }
        this._isAttackReady = false;
        this._stopSwordCursor();
        this._checkPlayerAttack()
            .then(() => {
                this._hideSwordCursor();
                this._completeAttack();
            });
    },

    _checkPlayerAttack () {
        const criticalStart = this.criticalAttackBar.x - this.criticalAttackBar.width/2.0;
        const criticalEnd = this.criticalAttackBar.x + this.criticalAttackBar.width/2.0;
        const normalStart = -this.normalAttackBar.width/2.0;
        const normalEnd = this.normalAttackBar.width/2.0;
        const cursorX = this.swordCursor.x;
        if (cursorX >= criticalStart && cursorX <= criticalEnd) {
            return this._showPlayerCriticalAttack(66);
        } else if (cursorX >= normalStart && cursorX <= normalEnd) {
            return this._showPlayerNormalAttack(44);
        } else {
            return this._showPlayerMiss();
        }
    },

    _showPlayerMiss () {
        this.node.emit('player-miss');
        this._showMonsterDodgeAction();
        return this._showPlayerMissSign();
    },

    _showMonsterMiss () {
        this.node.emit('monster-miss');
        this._showMonsterAttackAction();
        return this._showMonsterMissSign();
    },

    _showPlayerNormalAttack (num) {
        this.node.emit('player-attack', num);
        this._showMonsterHurtAction();
        this._showNormalAttackSign(AttackType.PLAYER_ATTACK);
        return this._showPlayerAttackNumber(num);
    },

    _showPlayerCriticalAttack (num) {
        this.node.emit('player-attack', num);
        this._showMonsterHurtAction(true);
        this._showCriticalAttackSign();
        this._showCriticalSign();
        return this._showPlayerAttackNumber(num);
    },

    _showMonsterAttack (num) {
        return this._showMonsterAttackAction().then(() => {
            this.node.emit('monster-attack', num);
            this._showShakeEffect();
            this._showNormalAttackSign(AttackType.MONSTER_ATTACK);
            return this._showMonsterAttackNumber(num);
        });
    },

    _showMonsterAttackAction () {
        return new Promise(resolve => {
            cc.tween(this.monster.node)
                .by(3/30, {scale: -0.1})
                .call(resolve)
                .by(3/30, {scale: 0.1})
                .start();
        });
    },

    _showMonsterHurtAction (isCritical) {
        return new Promise(resolve => {
            const duration = isCritical ? 12/30 : 4/30;
            this.monster.node.color = cc.color(236, 57, 57);
            cc.tween(this.monster.node)
                .by(4/30, {x: -16})
                .by(4/30, {x: 16})
                .then(cc.tintTo(duration, 255, 255, 255))
                .call(resolve)
                .start();
        });
    },

    _showMonsterDodgeAction () {
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
                .by(16/30, {y: deltaY})
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
        return this._showSpecialSign(sign, 200);
    },

    _showMonsterMissSign () {
        const sign = this.spriteAtlas.getSpriteFrame('Miss');
        return this._showSpecialSign(sign, -200);
    },

    _showCriticalSign () {
        const sign = this.spriteAtlas.getSpriteFrame('Critical');
        return this._showSpecialSign(sign, 200);
    },

    _showSpecialSign (sign, deltaY) {
        return new Promise(resolve => {
            const originY = this.specialSign.node.y;
            this.specialSign.spriteFrame = sign;
            this.specialSign.node.active = true;
            this.specialSign.node.opacity = 255;
            cc.tween(this.specialSign.node)
                .show()
                .by(16/30, {y: deltaY})
                .delay(3/30)
                .to(4/30, {opacity: 0})
                .hide()
                .call(() => this.specialSign.node.y = originY)
                .call(resolve)
                .start();
        });
    },

});
