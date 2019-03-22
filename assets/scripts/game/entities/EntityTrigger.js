
const BaseEntity = require('BaseEntity');
const PanelManager = require('PanelManager');
const PanelGetItem = require('PanelGetItem');

const EntityView = require('EntityView');

cc.Class({
    extends: BaseEntity,

    properties: {
        
    },

    onLoad () {
        this.isBeforeEnterPass = true;
    },

    doAfterEnter (sender, callback) {
        this.getComponent(EntityView).play('down');
        if (this.gid === 408) {
            this._trigger408();
        }
        callback(null);
    },

    doAfterExit (sender, callback) {
        this.getComponent(EntityView).play('default');
        callback(null);
    },

    _trigger408 () {
        const event = new cc.Event.EventCustom('standopen', true);
        event.detail = 409;
        this.node.dispatchEvent(event);
    }
});
