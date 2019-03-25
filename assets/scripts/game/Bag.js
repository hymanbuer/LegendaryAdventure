
const infiniteItemSet = new Set([
    176, 177, 178, 179, 180, 181,
]);

cc.Class({
    mixins: [cc.EventTarget],

    ctor () {
        this._coins = 0;
        this._items = [];
        
        this.addItem(155, 5);
        this.addItem(156, 5);
        this.addItem(157, 5);

        this.addItem(360, 1);
        this.addItem(189, 1);
        this.addItem(165, 1);
    },

    addItem (gid, num = 1) {
        gid = this._parseGid(gid);
        let item = this._getItem(gid);
        if (!item) {
            item = {gid: gid, num: num};
            this._items.push(item);
        } else {
            item.num += num;
        }
        cc.assert(item.num >= 0, `don't has enough item to be removed`);

        this.emit('add-item', gid, num);
    },

    removeItem (gid, num = 1) {
        gid = this._parseGid(gid);
        const item = this._getItem(gid);
        cc.assert(item, `item not exist ${gid}`);
        if (infiniteItemSet.has(gid)) return;

        item.num -= num;
        cc.assert(item.num >= 0, `don't has enough item to be removed`);

        this.emit('remove-item', gid, num);
    },

    getNumOfItem (gid) {
        gid = this._parseGid(gid);
        const item = this._getItem(gid);
        return item ? item.num : 0;
    },

    getItems () {
        return this._items.map(item => {
            return {gid: item.gid, num: item.num};
        });
    },

    hasItem (gid) {
        gid = this._parseGid(gid);
        return this._getItem(gid) != null;
    },

    plusCoins (num) {
        this._coins += num;
        cc.assert(tihs._coins >= 0, 'coins less than 0');
    },

    minusCoins (num) {
        this._coins -= num;
        cc.assert(tihs._coins >= 0, 'coins less than 0');
    },

    getNumOfCoins () {
        return this._coins;
    },

    _getItem (gid) {
        gid = this._parseGid(gid);
        const index = this._items.findIndex(item => item.gid === gid);
        return index >= 0 ? this._items[index] : null;
    },

    _parseGid (gid) {
        return Number.parseInt(gid);
    },
});
