
const Game = require('Game');

cc.Class({
    extends: require('BaseEvent'),

    properties: {
    },

    onLoad () {
    },

    init (event) {
        this.entityGid = parseInt(event.ADDENTITY);
    },

    doBeforeEnter (sender, callback) {
        callback(null);
        Game.mapState.removeEntity(this.floorId, this.grid);
        this.node.emit('add-entity', this);
        this.node.destroy();
    },
});
