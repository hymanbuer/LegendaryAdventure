
const Game = require('Game');

const hideFilter = new Set([

]);
const hideRanges = [
    [39, 50], [64, 75], [89, 100], [114, 125], [139, 150],
    [153, 157], [176, 187],
];
hideRanges.forEach(range => {
    for (let i = range[0]; i <= range[1]; i++) {
        hideFilter.add(i);
    }
});

const useFilter = new Set([
    151, 152,
    2001,
]);

function applyHealthItem(gid) {
    const player = Game.player;
    if (player.hp >= player.maxHp) {
        Game.openPanel('notice', '您的生命值已满!');
        return false;
    } else {
        const percent = gid == 151 ? 0.25 : 0.5;
        const restore = player.maxHp * percent;
        player.hp += restore;
        return true;
    }
}

function applyItem(gid) {
    switch (gid) {
        case 2001:
            Game.openPanel('teleport');
            return true;
        case 151:
        case 152:
            return applyHealthItem(gid);
    }
    return false;
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
        if (item == null || !applyItem(item.gid)) {
            return;
        }

        const remain = Game.bag.reduceItem(item.gid);
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
