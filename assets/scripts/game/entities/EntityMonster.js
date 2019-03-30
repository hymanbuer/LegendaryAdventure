
const BaseEntity = require('BaseEntity');
const Game = require('Game');

cc.Class({
    extends: BaseEntity,

    properties: {
    },

    onLoad () {
    },

    onDestroy () {
    },

    doBeforeEnter (sender, callback) {
        Game.openPanel('gofight', this.floorId, this.gid, this.grid);
    },
});
