
const BaseEntity = require('BaseEntity');

cc.Class({
    extends: BaseEntity,

    properties: {

    },

    onLoad () {
        this.isBeforeEnterPass = true;
    },

    doBeforeEnter (sender, callback) {
        callback(null);
        this.node.zIndex -= 1;
    },

    doAfterEnter (sender, callback) {
        callback(null);
        this.node.emit('trigger-enter', this)
    },

    doAfterExit (sender, callback) {
        callback(null);
        this.node.zIndex += 1;
        this.node.emit('trigger-exit', this)
    },
});
