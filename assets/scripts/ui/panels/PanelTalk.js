
const TalkType = cc.Enum({
    Normal: -1,
    Task: -1,
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
            }
        },
        _talkList: [],

        talkTitle: '...',
        talkType: TalkType.Normal,

        accept: cc.Node,
    },

    onLoad () {
        this.title.string = this.talkTitle;
        this.text.string = '';
        this.accept.active = false;
    },

    run (title, talkList, type) {
        this.talkTitle = title;
        this.talkList = talkList;
        this.talkType = type;
    },

    start () {
        this._next = 0;
        this.title.string = this.talkTitle;
        this._showNextTalk();
    },

    onClick () {
        if (this._isLastTaskTalk()) return;

        this._showNextTalk();
    },

    onClickAccept () {
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
        return this.talkType === TalkType.Task 
            && this._next === this.talkList.length;
    },
});
