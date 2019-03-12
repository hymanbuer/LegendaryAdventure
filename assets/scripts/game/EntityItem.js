
const BaseEntity = require('BaseEntity');
const PanelManager = require('PanelManager');
const Game = require('Game');

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
        Game.mapState.removeEntity(this.floorId, this.grid);
        Game.bag.addItem(this.gid);
        PanelManager.instance.openPanel('get_item', this.gid)
        this.node.destroy();

        const event = new cc.Event.EventCustom('getitem', true);
        event.detail = this.gid;
        this.node.dispatchEvent(event);

        return Promise.resolve(true);
    },
});
