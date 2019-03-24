
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
});
