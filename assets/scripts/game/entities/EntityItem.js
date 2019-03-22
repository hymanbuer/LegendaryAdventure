
const BaseEntity = require('BaseEntity');
const Game = require('Game');

cc.Class({
    extends: BaseEntity,

    properties: {

    },

    onLoad () {
        this.isBeforeEnterPass = true;
    },

    doAfterEnter (sender, callback) {
        callback(null);
        Game.mapState.removeEntity(this.floorId, this.grid);
        Game.bag.addItem(this.gid);
        Game.openPanel('get_item', this.gid)
        this.node.destroy();
    },
});
