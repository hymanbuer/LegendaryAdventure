
const BaseEntity = require('BaseEntity');
const EntityView = require('EntityView');
const Game = require('Game');

cc.Class({
    extends: BaseEntity,

    properties: {
        
    },

    onLoad () {

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
                this._isRemoving = true;
                Game.bag.removeItem(data.ITEMNEEDED);
                Game.mapState.removeEntity(this.floorId, this.grid);

                const state = this.getComponent(EntityView).play('open');
                if (state) {
                    state.on('lastframe', ()=> {
                        this.node.destroy();
                        callback(null);
                    });
                } else {
                    this.node.destroy();
                    callback(null);
                }
            };
            const text = data.MESSAGE || data.ASKMESSAGE;
            const icon = Game.res.getSpriteFrame(data.ITEMNEEDED);
            Game.openPanel('use_item', useMethod, text, icon)
                .then(() => Game.onPanelClosed('use_item', () => {
                    if (!this._isRemoving) callback(null);
                }))
                .catch(callback);
        } else {
            Game.openPanel('notice').then(() => {
                Game.onPanelClosed('notice', () => callback(null));
            }, callback);
        }
    },
});
