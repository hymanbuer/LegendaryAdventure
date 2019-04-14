

const Game = require('Game');

cc.Class({
    extends: require('BaseEvent'),

    properties: {
    },

    onLoad () {
    },

    init (event) {
        this.event = event;
        this.awardGid = event.TASKAWARD;
        this.message = event.MESSAGE;
    },

    doBeforeEnter (sender, callback) {
        callback(null);

        if (!this.event.ADDENTITY && !this.event.TASKOVER) {
            this.node.destroy();
            Game.mapState.removeEntity(this.floorId, this.grid);
        }
        if (!Game.bag.hasItem(this.awardGid)) {
            Game.bag.addItem(this.awardGid);
            Game.openPanel('get_item_dialog', this.awardGid, this.message);
        }
    },
});
