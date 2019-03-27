
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
        _level: 0,
        _hp: 0,
        _maxHp: 0,
        _attack: 0,
        _defence: 0,
        _exp: 0,
        _nextExp: 0,

        level: {
            get () {
                return this._level;
            },
            set (value) {
                this._level = value;
                this.node.emit('player-level-changed', this);
            }
        },

        hp: {
            get () {
                return this._hp;
            },
            set (value) {
                this._hp = value;
                this.node.emit('player-hp-changed', this);
            }
        },

        maxHp: {
            get () {
                return this._maxHp;
            },
            set (value) {
                this._maxHp = value;
                this.node.emit('player-maxhp-changed', this);
            }
        },

        attack: {
            get () {
                return this._attack;
            },
            set (value) {
                this._attack = value;
                this.node.emit('player-attack-changed', this);
            }
        },

        defence: {
            get () {
                return this._defence;
            },
            set (value) {
                this._defence = value;
                this.node.emit('player-defence-changed', this);
            }
        },

        exp: {
            get () {
                return this._exp;
            },
            set (value) {
                this._exp = value;
                this.node.emit('player-exp-changed', this);
            }
        },

        nextExp: {
            get () {
                return this._nextExp;
            },
            set (value) {
                this._nextExp = value;
                this.node.emit('player-nextexp-changed', this);
            }
        },
    },

    onLoad () {
        this._initProperties();
    },

    _initProperties () {
        const info = GameProfile.player;
        this.level = info.level;
        this.hp = info.hp;
        this.maxHp = info.maxHp;
        this.attack = info.attack;
        this.defence = info.defence;
        this.exp = info.exp;
        this.nextExp = info.nextExp;
    },
});
