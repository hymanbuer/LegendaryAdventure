
const BaseEntity = require('BaseEntity');

cc.Class({
    extends: cc.Component,

    properties: {
        gid: {
            get () {
                return this.getComponent(BaseEntity).gid;
            }
        },
        floorId: {
            get () {
                return this.getComponent(BaseEntity).floorId;
            }
        },
        grid: {
            get () {
                return this.getComponent(BaseEntity).grid;
            }
        },
    },

    onLoad () {
    },

    init (event) {
    },

    doBeforeEnter (sender, callback) {
        callback(null);
    },

    doAfterEnter (sender, callback) {
        callback(null);
    },

    doBeforeExit (sender, callback) {
        callback(null);
    },

    doAfterExit (sender, callback) {
        callback(null);
    },
});
