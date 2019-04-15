
const setting = require('GameSetting');
const Game = require('Game');

const AttackType = cc.Enum({
    PLAYER_CRITICAL_ATTACK: 'baoji',
    PLAYER_ATTACK: 'dj',
    MONSTER_ATTACK: 'zh',
});

const ROOT_BAR_WIDTH = 768;
const NORMAL_ATTACK_WIDTH = 480;
const CRITICAL_ATTACK_WIDTH = 56;
const CRITICAL_TIMES = 1.5;
const MISS_RATIO = 0.05;

// this.resetBattleData({
//     hp: 360,
//     maxHp: 360,
//     attack: 20,
//     defence: 10,
// }, {
//     id: 226,
//     name: '王宫卫士',
//     hp: 360,
//     maxHp: 360,
//     attack: 18,
//     defence: 8,
//     criticalPos: 7,
//     criticalLength: 1.2,
//     cursorMoveDuration: 1.0,
// });
cc.Class({
    extends: cc.Component,

    properties: {
        battleBg: cc.Sprite,
        
        playerAttackNumber: cc.Label,
        monsterAttackNumber: cc.Label,
        monsterName: cc.Label,
        monsterHp: cc.Label,
        monsterHpProgress: cc.ProgressBar,

        monster: cc.Sprite,
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
    },

    onDestroy () {
    },

    start () {
    },

    onEnable () {
        this.rootBar.on(cc.Node.EventType.SIZE_CHANGED, this._udpateAttackRange, this);
        this.node.on('player-attack', this._onPlayerAttack, this);
        this.node.on('monster-attack', this._onMonsterAttack, this);
        this.node.on('player-miss', this._onAttackMiss, this);
        this.node.on('monster-miss', this._onAttackMiss, this);
    },

    onDisable () {
        this.rootBar.off(cc.Node.EventType.SIZE_CHANGED, this._udpateAttackRange, this);
        this.node.off('player-attack', this._onPlayerAttack, this);
        this.node.off('monster-attack', this._onMonsterAttack, this);
        this.node.off('player-miss', this._onAttackMiss, this);
        this.node.off('monster-miss', this._onAttackMiss, this);
    },

    update (dt) {
        if (this._isAttackReady) {
            this._doNextTurn();
        }
    },

    resetBattleData (player, monster) {
        this.battleBg.spriteFrame = null;
        Game.res.getLargeBattleBg(monster.floorId).then(spriteFrame => {
            this.battleBg.spriteFrame = spriteFrame;
        });
        this.monster.spriteFrame = null;
        Game.res.getLargeMonster(monster.gid).then(spriteFrame => {
            this.monster.spriteFrame = spriteFrame;
        });

        this._player = player;
        this._monster = monster;
        this._criticalPos = monster.criticalPos;
        this._criticalLength = monster.criticalLength;
        this._cursorMoveDuration = monster.cursorMoveDuration;
        this._udpateAttackRange();

        this._totalAttackCount = 0;
        this.node.opacity = 0;
        this.node.runAction(cc.sequence(cc.fadeIn(0.5), cc.callFunc(() => {
            this._isAttackReady = true;
        })));

        this.monsterName.string = monster.name;
        this.monsterHp.string = `${monster.maxHp}:${monster.maxHp}`;
        this.monsterHpProgress.progress = 1.0;
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

    _udpateAttackRange () {
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
        let attack = this._showPlayerMiss;
        let damage = 0;
        if (Math.random() > MISS_RATIO) {
            damage = this._calculateDamage(this._player, this._monster);
            attack = this._showPlayerNormalAttack;
            this._monster.hp = Math.max(0, this._monster.hp - damage);
        }
        this._isAttackReady = false;
        attack.call(this, damage).then(() => this._completeAttack());
    },

    _doMonsterAttack () {
        let attack = this._showMonsterMiss;
        let damage = 0;
        if (Math.random() > MISS_RATIO) {
            damage = this._calculateDamage(this._monster, this._player);
            attack = this._showMonsterAttack;
            this._player.hp = Math.max(0, this._player.hp - damage);
        }
        this._isAttackReady = false;
        attack.call(this, damage).then(() => this._completeAttack());
    },

    _completeAttack () {
        this._totalAttackCount += 1;
        if (!this._checkBattleOver()) {
            this._isAttackReady = true;
        }
    },

    _checkBattleOver () {
        const isOver = this._player.hp <= 0 || this._monster.hp <= 0;
        if (isOver) {
            this.node.emit('battle-over', this._player, this._monster, this._monster.hp <= 0);
        }
        return isOver;
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
        let attack = this._showPlayerMiss;
        let damage = 0;
        if (cursorX >= criticalStart && cursorX <= criticalEnd) {
            damage = this._calculateDamage(this._player, this._monster, true);
            attack = this._showPlayerCriticalAttack;
        } else if (cursorX >= normalStart && cursorX <= normalEnd) {
            damage = this._calculateDamage(this._player, this._monster, false);
            attack = this._showPlayerNormalAttack;
        }
        this._monster.hp = Math.max(0, this._monster.hp - damage);

        return attack.call(this, damage);
    },

    _calculateDamage (attacker, defencer, isCritical) {
        let damage = Math.max(0, attacker.attack - defencer.defence);
        if (isCritical) {
            damage = Math.floor(damage * CRITICAL_TIMES);
        }
        return damage;
    },

    _onPlayerAttack (num, isCritical) {
        this.monsterHp.string = `${this._monster.hp}:${this._monster.maxHp}`;
        this.monsterHpProgress.progress = this._monster.hp / this._monster.maxHp;
        if (isCritical) {
            Game.audio.playEffect('player-critical-attack');
        } else {
            Game.audio.playEffect('player-attack');
        }
    },

    _onMonsterAttack (num) {
        Game.audio.playEffect('monster-attack');
    },

    _onAttackMiss (num) {
        Game.audio.playEffect('miss');
    },

    _showPlayerMiss () {
        return Promise.resolve().then(() => {
            this.node.emit('player-miss');
            this._showMonsterDodgeAction();
            return this._showPlayerMissSign();
        });
    },

    _showMonsterMiss () {
        return Promise.resolve().then(() => {
            this.node.emit('monster-miss');
            this._showMonsterAttackAction();
            return this._showMonsterMissSign();
        });
    },

    _showPlayerNormalAttack (num) {
        return Promise.resolve().then(() => {
            this.node.emit('player-attack', num);
            this._showMonsterHurtAction();
            this._showNormalAttackSign(AttackType.PLAYER_ATTACK);
            return this._showPlayerAttackNumber(num);
        });
    },

    _showPlayerCriticalAttack (num) {
        return Promise.resolve().then(() => {
            this.node.emit('player-attack', num, true);
            this._showMonsterHurtAction(true);
            this._showCriticalAttackSign();
            this._showCriticalSign();
            return this._showPlayerAttackNumber(num);
        });
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
