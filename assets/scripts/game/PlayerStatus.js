
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
    mixins: [cc.EventTarget],

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
                this.emit('player-level-changed', this);
            }
        },

        hp: {
            get () {
                return this._hp;
            },
            set (value) {
                this._hp = value;
                this.emit('player-hp-changed', this);
            }
        },

        maxHp: {
            get () {
                return this._maxHp;
            },
            set (value) {
                this._maxHp = value;
                this.emit('player-maxhp-changed', this);
            }
        },

        attack: {
            get () {
                return this._attack;
            },
            set (value) {
                this._attack = value;
                this.emit('player-attack-changed', this);
            }
        },

        defence: {
            get () {
                return this._defence;
            },
            set (value) {
                this._defence = value;
                this.emit('player-defence-changed', this);
            }
        },

        exp: {
            get () {
                return this._exp;
            },
            set (value) {
                this._exp = value;
                this.emit('player-exp-changed', this);
            }
        },

        nextExp: {
            get () {
                return this._nextExp;
            },
            set (value) {
                this._nextExp = value;
                this.emit('player-nextexp-changed', this);
            }
        },
    },

    load (player) {
        this.level = player.level;
        this.hp = player.hp;
        this.maxHp = player.maxHp;
        this.attack = player.attack;
        this.defence = player.defence;
        this.exp = player.exp;
        this.nextExp = player.nextExp;
    },
});
