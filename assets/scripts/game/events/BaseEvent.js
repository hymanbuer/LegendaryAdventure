
const BaseEntity = require('BaseEntity');

cc.Class({
    extends: cc.Component,

    properties: {
        gid: {
            get () {
                const entity = this.getComponent(BaseEntity);
                return entity ? entity.gid : 0;
            }
        },
        floorId: {
            get () {
                const entity = this.getComponent(BaseEntity);
                return entity ? entity.floorId : 0;
            }
        },
        grid: {
            get () {
                const entity = this.getComponent(BaseEntity);
                return entity ? entity.grid : cc.v2();
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
