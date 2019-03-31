
const GameConfig = require('GameConfig');

cc.Class({
    mixins: [cc.EventTarget],

    ctor () {
        this._coins = 0;
        this._items = [];
    },

    load (bag) {
        this._coins = bag.coins;
        this._items = bag.items;
    },

    dump () {

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
        if (GameConfig.isInfiniteItem(gid)) return;

        item.num -= num;
        cc.assert(item.num >= 0, `don't has enough item to be removed`);

        this.emit('remove-item', gid, num);
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
        const index = this._items.findIndex(item => item.gid === gid);
        return index >= 0 ? this._items[index] : null;
    },
});
