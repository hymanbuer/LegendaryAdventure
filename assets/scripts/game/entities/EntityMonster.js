
const BaseEntity = require('BaseEntity');
const Game = require('Game');

cc.Class({
    extends: BaseEntity,

    properties: {
    },

    onLoad () {
    },

    onDestroy () {
        if (Game.mapState) {
            Game.mapState.removeEntity(this.floorId, this.grid);
        }
    },

    doBeforeEnter (sender, callback) {
        Game.openPanel('gofight', this.floorId, this.gid);
        Game.onPanelClosed('gofight', () => {
            this.node.destroy();
            callback(null);
        });
    },
});
