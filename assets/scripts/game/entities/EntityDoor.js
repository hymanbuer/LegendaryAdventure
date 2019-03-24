
const BaseEntity = require('BaseEntity');
const Game = require('Game');

cc.Class({
    extends: BaseEntity,

    properties: {
        
    },

    onLoad () {

    },

    open (callback) {
        if (this._isRemoving) {
            return;
        }
        this._isRemoving = true;
        Game.mapState.removeEntity(this.floorId, this.grid);
        this.node.emit('open', callback);
    },

    doBeforeEnter (sender, callback) {
        if (this._isRemoving) {
            callback(null);
            return;
        }
        this._checkItemNeeded(callback);
    },

    _checkItemNeeded (callback) {
        const data = Game.dataCenter.getMonster(this.gid);
        if (data == null || data.ITEMNEEDED == null) {
            return callback(null);
        }

        if (Game.bag.hasItem(data.ITEMNEEDED)) {
            const useMethod = () => {
                Game.bag.removeItem(data.ITEMNEEDED);
                this.open(callback);
            };
            const text = data.MESSAGE || data.ASKMESSAGE;
            const icon = Game.res.getItemSpriteFrameByGid(data.ITEMNEEDED);
            Game.openPanel('use_item', useMethod, text, icon);
            Game.onPanelClosed('use_item', () => {
                if (!this._isRemoving) callback(null);
            });
        } else {
            Game.openPanel('notice', data.ANSWERMESSAGE);
            Game.onPanelClosed('notice', () => callback(null));
        }
    },
});
