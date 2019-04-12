
const Game = require('Game');

cc.Class({
    extends: require('BaseEvent'),

    properties: {
    },

    onLoad () {
    },

    init (event) {
        this.event = event;
        this.title = event.NAME;
        this.gift = event.TASKGIFT;
        this.message = event.MESSAGE;
    },

    doBeforeEnter (sender, callback) {
        if (Game.taskState.isNeedItem(this.gift) && !Game.bag.hasItem(this.gift)) {
            callback(false);
            Game.bag.addItem(this.gift);
            if (this.event.TASKPROGESS) {
                Game.openPanel('talk', this.title, this.event.TASKPROGESS);
                Game.onPanelClosed('talk', () => {
                    Game.openPanel('get_item_dialog', this.gift, this.message);
                });
            } else {
                Game.openPanel('get_item_dialog', this.gift, this.message);
            }
        } else {
            callback(null);
        }
    },
});
