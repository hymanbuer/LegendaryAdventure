
const TalkType = require('PanelTalk').TalkType;
const Game = require('Game');

class EventAward {
    constructor (event) {
        this.awardGid = Number.parseInt(event.TASKAWARD);
        this.message = event.MESSAGE;
    }

    fire (trigger) {
        return new Promise(resolve => {
            trigger.node.destroy();
            Game.bag.addItem(this.awardGid);

            return Game.openPanel('get_item_dialog', this.awardGid, this.message)
                .then(() => Game.onPanelClosed('get_item_dialog', () => resolve(true)));
        });
    }
}

cc.Class({
    extends: require('EventTrigger'),

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
