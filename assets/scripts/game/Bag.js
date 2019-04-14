
const GameConfig = require('GameConfig');

cc.Class({
    mixins: [cc.EventTarget],

    ctor () {
        this._coins = 0;
        this._items = [];
    },

    load (bag) {
        this._coins = bag.coins || 0;
        this._items = bag.items || [];
    },

    dump () {
        const bag = {};
        bag.coins = this._coins;
        bag.items = this._items;
        return bag;
    },

    addItem (gid, num = 1) {
        let item = this._getItem(gid);
        if (!item) {
            item = {gid: gid, num: num};
            this._items.push(item);
        } else {
            item.num += num;
        }
        cc.assert(item.num >= 0, `don't has enough item to be removed`);

        this.emit('add-item', gid, num);
        return item.num;
    },

    reduceItem (gid, num = 1) {
        const item = this._getItem(gid);
        cc.assert(item, `item not exist ${gid}`);
        if (GameConfig.isInfiniteItem(gid)) {
            return item.num;
        }

        item.num -= num;
        cc.assert(item.num >= 0, `don't has enough item to be removed`);

        if (item.num == 0) {
            cc.js.array.remove(this._items, item);
        }

        this.emit('reduce-item', gid, num);
        return item.num;
    },

    getNumOfItem (gid) {
        const item = this._getItem(gid);
        return item ? item.num : 0;
    },

    getItems () {
        return this._items.map(item => ({gid: item.gid, num: item.num}))
            .filter(item => item.num > 0);
    },

    hasItem (gid) {
        const item = this._getItem(gid);
        return item && item.num > 0;
    },

    plusCoins (num) {
        this._coins += num;
        cc.assert(this._coins >= 0, 'coins less than 0');
        this.emit('coins-changed', num);
        return this._coins;
    },

    minusCoins (num) {
        this._coins -= num;
        cc.assert(this._coins >= 0, 'coins less than 0');
        this.emit('coins-changed', num);
        return this._coins;
    },

    getNumOfCoins () {
        return this._coins;
    },

    _getItem (gid) {
        return this._items.find(item => item.gid === gid);
    },
});
