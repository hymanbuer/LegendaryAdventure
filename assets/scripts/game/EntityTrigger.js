
const BaseEntity = require('BaseEntity');
const PanelManager = require('PanelManager');
const PanelGetItem = require('PanelGetItem');

const EntityView = require('EntityView');



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
        this.getComponent(EntityView).play('down');
        if (this.gid === 408) {
            this._trigger408();
        }
        return Promise.resolve(true);
    },

    doAfterExit () {
        this.getComponent(EntityView).play('default');
        return Promise.resolve(true);
    },

    _trigger408 () {
        const event = new cc.Event.EventCustom('standopen', true);
        event.detail = 409;
        this.node.dispatchEvent(event);
    }
});
