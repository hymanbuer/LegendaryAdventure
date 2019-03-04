
cc.Class({
    extends: cc.Component,

    properties: {
        walk: {
            default: null,
            type: cc.TextAsset,
        }
    },

    start () {
        // cc.log(this.walk);
        const result = cc.plistParser.parse(this.walk.text);
        cc.log(result);
    },
});
