
const Game = require('Game');

cc.Class({
    extends: require('BaseEvent'),

    properties: {
    },

    onLoad () {
    },

    init (event) {
        this.event = event;
    },

    doBeforeEnter (sender, callback) {
        callback(null);
        if (this.gid == 9) {
            Game.openPanel('shop', false);
        }
    },
});
