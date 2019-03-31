
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
                this._hp = cc.misc.clampf(value, 0, this._maxHp);
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
                this._exp = cc.misc.clampf(value, 0, this._nextExp);;
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
        this._level = player.level;
        this._hp = player.hp;
        this._maxHp = player.maxHp;
        this._attack = player.attack;
        this._defence = player.defence;
        this._exp = player.exp;
        this._nextExp = player.nextExp;

        this._sword = player.sword || {};
        this._shield = player.shield || {};
    },

    changeSword (sword) {
        const previous = this._sword;
        if (previous.gid) {
            this.attack -= previous.base;
            this.attack -= previous.enhance.level * previous.enhance.step;
        }
        this._sword = sword;
        this.attack += sword.base;
        this.attack += sword.enhance.level * sword.enhance.step;
    },

    changeShield (shield) {
        const previous = this._shield;
        if (previous.gid) {
            this.defence -= previous.base;
            this.defence -= previous.enhance.level * previous.enhance.step;
        }
        this._shield = shield;
        this.defence += sword.base;
        this.defence += sword.enhance.level * sword.enhance.step;
    },

    addSwordStone (gid) {
        this._sword.stones.push(gid);
    },

    addShieldStone (gid) {
        this._shield.stones.push(gid);
    },

    hasSword () {
        return !!this._sword.gid;
    },

    hasShield () {
        return !!this._shield.gid;
    },
});
