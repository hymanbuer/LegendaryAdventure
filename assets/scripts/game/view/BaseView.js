
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
});
