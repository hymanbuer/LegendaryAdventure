
const BaseEntity = require('BaseEntity');
const PanelManager = require('PanelManager');
const Bag = require('Bag');
const MapState = require('MapState');

cc.Class({
    extends: BaseEntity,

    properties: {
        
    },

    onLoad () {

    },

    doBeforeEnter () {
        return Promise.resolve(true);
    },

    doAfterEnter () {
        MapState.instance.removeEntity(this.floorId, this.grid);
        Bag.instance.addItem(this.gid);
        PanelManager.instance.openPanel('get_item', this.gid)
        this.node.destroy();

        const event = new cc.Event.EventCustom('getitem', true);
        event.detail = this.gid;
        this.node.dispatchEvent(event);

        return Promise.resolve(true);
    },
});
