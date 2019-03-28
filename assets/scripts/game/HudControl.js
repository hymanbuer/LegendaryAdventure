
const Game = require('Game');
const Utils = require('Utils');
const GameProfile = require('GameProfile');

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

        siteName: cc.Sprite,
        siteFloor: cc.Label,

        numYellowKeys: cc.Label,
        numBlueKeys: cc.Label,
        numRedKeys: cc.Label,

        top: cc.Node,
        bottom: cc.Node,
    },

    onLoad () {
        Game.bag.on('add-item', this.onItemChanged, this);
        Game.bag.on('remove-item', this.onItemChanged, this);
    },

    start () {
        this._initPlayerStatus();
        this._updateNumKeys();
    },

    _initPlayerStatus () {
        const info = GameProfile.player;
        this.setLevel(info.level);
        this.setAttack(info.attack);
        this.setDefence(info.defence);
        this.setExpStatus(info.exp, info.nextExp);
        this.setHpStatus(info.hp, info.maxHp);
    },

    _updateNumKeys () {
        this.numYellowKeys.string = Game.bag.getNumOfItem(155);
        this.numBlueKeys.string = Game.bag.getNumOfItem(156);
        this.numRedKeys.string = Game.bag.getNumOfItem(157);
    },

    observePlayerStatus (player) {
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
    },

    changeSite (floorId) {
        this.siteName.spriteFrame = Game.res.getSiteNameSpriteFrame(floorId);
        this.siteFloor.string = ':' + Utils.fixedNumber(floorId, 2);
    },

    onItemChanged (gid) {
        if (gid == 155 || gid == 156 || gid == 157) {
            this._updateNumKeys();
        }
    },

    onLevelChanged (playerStatus) {

    },

    onHpStatusChanged (playerStatus) {

    },

    onAttackChanged (playerStatus) {

    },

    onDefenceChanged (playerStatus) {

    },

    onExpStatusChanged (playerStatus) {

    },

    onClickLevel () {

    },

    onClickAttack () {

    },

    onClickDefence () {

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
