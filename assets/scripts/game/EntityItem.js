
const BaseEntity = require('BaseEntity');
const UiManager = require('UiManager');
const Bag = require('Bag');
const UiGetItem = require('UiGetItem');
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
        UiManager.instance.showUi('prefabs/ui_get_item').then(ui => {
            ui.getComponent(UiGetItem).setItem(this.gid);
        });
        this.node.destroy();

        const event = new cc.Event.EventCustom('getitem', true);
        event.detail = this.gid;
        this.node.dispatchEvent(event);

        return Promise.resolve(true);
    },
});
