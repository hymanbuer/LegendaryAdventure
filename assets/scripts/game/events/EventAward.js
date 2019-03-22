

const Game = require('Game');

cc.Class({
    extends: require('EventTrigger'),

    properties: {
    },

    onLoad () {
    },

    init (event) {
        this.awardGid = Number.parseInt(event.TASKAWARD);
        this.message = event.MESSAGE;
    },

    doBeforeEnter (sender, callback) {
        this.node.destroy();
        Game.bag.addItem(this.awardGid);

        Game.openPanel('get_item_dialog', this.awardGid, this.message);
        Game.onPanelClosed('get_item_dialog', () => callback(null));
    },
});
