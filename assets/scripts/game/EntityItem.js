
const BaseEntity = require('BaseEntity');
const Game = require('Game');

cc.Class({
    extends: BaseEntity,

    properties: {
        
    },

    onLoad () {

    },

    doBeforeEnter () {
        return Promise.resolve(true);
    },

    doAfterEnter () {
        Game.mapState.removeEntity(this.floorId, this.grid);
        Game.bag.addItem(this.gid);
        Game.openPanel('get_item', this.gid)
        this.node.destroy();
        
        return Promise.resolve(true);
    },
});
