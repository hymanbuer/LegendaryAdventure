
const TalkType = cc.Enum({
    Normal: 0,
    Task: 1,
    Shop: 2,
});

const PanelTalk = cc.Class({
    extends: cc.Component,

    statics: {
        TalkType: TalkType,
    },

    properties: {
        title: cc.Label,
        text: cc.Label,

        talkList: {
            get () { return this._talkList; },
            set (value) {
                if (typeof value === 'string') {
                    value = {text: value};
                }
                if (!(value instanceof Array)) {
                    value = [value];
                }
                this._talkList = value;
                this._next = 0;
            }
        },
        _talkList: [],
        _talkType: TalkType.Normal,

        accept: cc.Node,
        shopNode: cc.Node,
        shopTalk: cc.Node,
        shopGet: cc.Node,
        shopUpgrade: cc.Node,
    },

    onLoad () {
        this.title.string = '...';
        this.text.string = '';
        this.accept.active = false;
        this.shopNode.active = false;
    },

    run (title, talkList, type, shopInfo) {
        this.title.string = title || '...';
        this.talkList = talkList;
        this._talkType = type || TalkType.Normal;

        this._shopInfo = shopInfo || {};
        if (type == TalkType.Shop) {
            this.shopNode.active = true;
            this.shopTalk.active = this._shopInfo.hasTalk;
            this.shopGet.active = this._shopInfo.hasGet;
            this.shopUpgrade.active = this._shopInfo.hasUpgrade;
        }
    },

    start () {
        this._showNextTalk();
    },

    onClick () {
        if (this._isLastTaskTalk()) return;

        this._showNextTalk();
    },

    onClickAccept () {
        this.node.destroy();
    },

    onClickShopTalk () {
        this.shopNode.active = false;
        this.talkList = this._shopInfo.talkList;
        this._showNextTalk();
    },

    onClickShopGet () {
        if (this._shopInfo.getCallback) {
            this._shopInfo.getCallback();
        }
        this.node.destroy();
    },

    onClickShopUpgrade () {
        if (this._shopInfo.upgradeCallback) {
            this._shopInfo.upgradeCallback();
        }
        this.node.destroy();
    },

    _showNextTalk () {
        if (this._next >= this.talkList.length) {
            this.node.destroy();
            return;
        }

        const talk = this.talkList[this._next];
        this._next += 1;
        this.text.string = talk.text;

        if (this._isLastTaskTalk())
            this.accept.active = true;
    },

    _isLastTaskTalk () {
        return this._talkType === TalkType.Task 
            && this._next === this.talkList.length;
    },
});
