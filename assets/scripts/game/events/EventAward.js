

const Game = require('Game');

cc.Class({
    extends: require('BaseEvent'),

    properties: {
    },

    onLoad () {
    },

    init (event) {
        this.awardGid = event.TASKAWARD;
        this.message = event.MESSAGE;
        if (event.ADDENTITY) {
            this.delayDestroy = true;
        }
    },

    doBeforeEnter (sender, callback) {
        callback(null);

        if (!this.delayDestroy) {
            this.node.destroy();
            Game.mapState.removeEntity(this.floorId, this.grid);
        }
        Game.bag.addItem(this.awardGid);

        Game.openPanel('get_item_dialog', this.awardGid, this.message);
    },
});
