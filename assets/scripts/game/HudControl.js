
const Game = require('Game');
const Utils = require('Utils');

const HP_LOWER_PERCENT = 0.3;

/**
 * Events:
 *   player-level-changed
 *   player-hp-changed
 *   player-maxhp-changed
 *   player-attack-changed
 *   player-defence-changed
 *   player-exp-changed
 *   player-nextexp-changed
 *   
 */

cc.Class({
    extends: cc.Component,

    properties: {
        level: cc.Label,
        attack: cc.Label,
        defence: cc.Label,
        hpStatus: cc.Label,
        hpBar: cc.ProgressBar,
        expBar: cc.ProgressBar,
        hpWarn: cc.Node,

        siteName: cc.Sprite,
        siteFloor: cc.Label,

        numYellowKeys: cc.Label,
        numBlueKeys: cc.Label,
        numRedKeys: cc.Label,

        top: cc.Node,
        bottom: cc.Node,

        keys: cc.Node,
        mission: cc.Node,
    },

    onLoad () {
        Game.bag.on('add-item', this.onItemChanged, this);
        Game.bag.on('remove-item', this.onItemChanged, this);
    },

    start () {
        this._initPlayerStatus();
        this._observePlayerStatus();
        this._updateNumKeys();
    },

    enterBattleField () {
        this.keys.active = false;
        this.mission.active = false;
    },

    exitBattleField () {
        this.keys.active = true;
        this.mission.active = true;
    },

    _initPlayerStatus () {
        const player = Game.player;
        this.setLevel(player.level);
        this.setAttack(player.attack);
        this.setDefence(player.defence);
        this.setExpStatus(player.exp, player.nextExp);
        this.setHpStatus(player.hp, player.maxHp);
    },

    _updateNumKeys () {
        this.numYellowKeys.string = Game.bag.getNumOfItem(Game.config.KEY_YELLOW);
        this.numBlueKeys.string = Game.bag.getNumOfItem(Game.config.KEY_BLUE);
        this.numRedKeys.string = Game.bag.getNumOfItem(Game.config.KEY_RED);
    },

    _observePlayerStatus () {
        const player = Game.player;
        player.on('player-level-changed', this.onLevelChanged, this);
        player.on('player-hp-changed', this.onHpStatusChanged, this);
        player.on('player-maxhp-changed', this.onHpStatusChanged, this);
        player.on('player-attack-changed', this.onAttackChanged, this);
        player.on('player-defence-changed', this.onDefenceChanged, this);
        player.on('player-exp-changed', this.onExpStatusChanged, this);
        player.on('player-nextexp-changed', this.onExpStatusChanged, this);
    },

    setLevel (level) {
        this.level.string = Utils.fixedNumber(level, 2);
    },

    setAttack (attack) {
        this.attack.string = Utils.fixedNumber(attack, 2);
    },

    setDefence (defence) {
        this.defence.string = Utils.fixedNumber(defence, 2);
    },

    setExpStatus (exp, nextExp) {
        this.expBar.progress = exp / nextExp;
    },

    setHpStatus (hp, maxHp) {
        this.hpBar.progress = hp / maxHp;
        this.hpStatus.string = `${hp}:${maxHp}`;
        this.hpWarn.active = hp > 0 && this.hpBar.progress <= HP_LOWER_PERCENT;
    },

    changeSite (floorId) {
        this.siteName.spriteFrame = Game.res.getSiteNameSpriteFrame(floorId);
        this.siteFloor.string = ':' + Utils.fixedNumber(floorId, 2);
    },

    onItemChanged (gid) {
        if (Game.config.isKeyItem(gid)) {
            this._updateNumKeys();
        }
    },

    onLevelChanged (playerStatus) {
        this.setLevel(playerStatus.level);
    },

    onHpStatusChanged (playerStatus) {
        this.setHpStatus(playerStatus.hp, playerStatus.maxHp);
    },

    onAttackChanged (playerStatus) {
        this.setAttack(playerStatus.attack);
    },

    onDefenceChanged (playerStatus) {
        this.setDefence(playerStatus.defence);
    },

    onExpStatusChanged (playerStatus) {
        this.setExpStatus(playerStatus.exp, playerStatus.nextExp);
    },

    onClickLevel () {
        Game.openPanel('stat');
    },

    onClickAttack () {
        if (Game.player.hasSword()) {
            Game.openPanel('equipment', true);
        } else {
            Game.openPanel('notice', '您还没有获得武器!');
        }
    },

    onClickDefence () {
        if (Game.player.hasShield()) {
            Game.openPanel('equipment', false);
        } else {
            Game.openPanel('notice', '您还没有获得盾牌!');
        }
    },

    onClickBag () {
        Game.openPanel('bag');
    },

    onClickSetting () {
        Game.openPanel('setting');
    },

    onClickQuest () {
        if (Game.taskState.hasRunningTask()) {
            Game.openPanel('quest');
        } else {
            Game.openPanel('notice', '没有进行中的任务!');
        }
    },
});
