
const TalkType = require('PanelTalk').TalkType;
const Game = require('Game');

cc.Class({
    extends: require('BaseEvent'),

    properties: {
    },

    onLoad () {
    },

    init (event) {
        this.title = event.NAME;
        this.talkList = event.TALK;
    },

    doBeforeEnter (sender, callback) {
        Game.openPanel('talk', this.title, this.talkList, TalkType.Normal);
        Game.onPanelClosed('talk', () => callback(null));
    },
});
