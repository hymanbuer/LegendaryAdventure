
const Game = require('Game');
const TalkType = require('PanelTalk').TalkType;

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

        const title = this.event.NAME;
        const shopTalk = this.event.SHOPTALK;
        const shopArgs = this._getShopArgs();
        Game.openPanel('talk', title, shopTalk, TalkType.Shop, shopArgs);
        Game.onPanelClosed('talk', () => {
            this._doAfterShopTalk();
        });
    },

    _getShopArgs () {
        if (this.gid == 9) {
            return {};
        }

        const args = {};
        args.hasTalk = true;
        args.talkList = this.event.PRINCESSTALK;
        if (this.gid == 7) {
            args.hasUpgrade = true;
            args.upgradeCallback = () => {
                Game.openPanel('equipment_upgrade');
            };
        }
        else if (this.event.NOTREADYSHOPTALK) {
            args.hasGet = true;
            // TODO: get specific item
        }
        
        return args;
    },

    _doAfterShopTalk () {
        if (this.gid == 9) {
            Game.openPanel('shop', false);
        }
    },
});
