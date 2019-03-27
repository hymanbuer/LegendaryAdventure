
const Game = require('Game');

const hideFilter = new Set([
    153, 154, 155, 156, 157,
    176, 177, 178, 179, 180, 181,
]);
const useFilter = new Set([
    151, 152,
    2001,
]);

function applyItem(gid) {
    if (gid === 2001) {
        Game.openPanel('teleport');
    } else {

    }
}

cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab: cc.Prefab,
        itemContainer: cc.Node,
        usePanel: cc.Node,
        useBtn: cc.Node,
        itemName: cc.Label,
        itemTips: cc.Label,
        coins: cc.Label,
    },

    onLoad () {
        this.usePanel.active = false;
        this.coins.string = Game.bag.getNumOfCoins();
    },

    start () {
        this.itemContainer.removeAllChildren();
        const items = Game.bag.getItems();
        items.filter(item => !hideFilter.has(item.gid))
            .forEach(item => {
                const node = cc.instantiate(this.itemPrefab);
                node.getComponent('BagItem').init(item.gid, item.num);
                this.itemContainer.addChild(node);
            });
    },

    onClickClose () {
        this.node.destroy();
    },

    onCheckItem (event) {
        this.itemContainer.getComponent(cc.ToggleContainer).allowSwitchOff = false;
        this.usePanel.active = true;

        const item = event.target.getComponent('BagItem');
        const info = Game.data.getItemInfo(item.gid);
        this.itemName.string = info.NAME;
        this.itemTips.string = info.MESSAGE;
        this.useBtn.active = useFilter.has(item.gid);

        this._checkedItem = item;
    },

    onClickUse () {
        const item = this._checkedItem;
        if (item == null) {
            return;
        }

        applyItem(item.gid);
        Game.bag.reduceItem(item.gid)

        const remain = Game.bag.getNumOfItem(item.gid);
        if (remain <= 0) {
            item.node.destroy();
            this._checkedItem = null;
        } else {
            item.updateCount(remain);
        }
    },

    onClickPlus () {

    },
});
