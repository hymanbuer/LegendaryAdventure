
const BaseEntity = require('BaseEntity');
const PanelManager = require('PanelManager');
const PanelNotice = require('PanelNotice');
const PanelUseItem = require('PanelUseItem');
const EntityView = require('EntityView');
const Game = require('Game');

cc.Class({
    extends: BaseEntity,

    properties: {
        
    },

    onLoad () {

    },

    doBeforeEnter () {
        return new Promise((resolve, reject) => {
            if (this._isRemoving) return resolve(false);

            this._checkItemNeeded(resolve, reject);
        });
    },

    doAfterEnter () {
        return Promise.resolve(true);
    },

    _checkItemNeeded (resolve, reject) {
        const data = Game.dataCenter.getMonster(this.gid);
        if (data && data.ITEMNEEDED) {
            if (Game.bag.hasItem(data.ITEMNEEDED)) {
                const useMethod = () => {
                    this._isRemoving = true;
                    Game.bag.removeItem(data.ITEMNEEDED);
                    Game.mapState.removeEntity(this.floorId, this.grid);

                    const event = new cc.Event.EventCustom('useitem', true);
                    event.detail = data.ITEMNEEDED;
                    this.node.dispatchEvent(event);

                    const state = this.getComponent(EntityView).play('open');
                    if (state) {
                        state.on('lastframe', ()=> {
                            this.node.destroy();
                            resolve(true);
                        });
                    } else {
                        this.node.destroy();
                        resolve(true);
                    }
                };
                const text = data.MESSAGE || data.ASKMESSAGE;
                const icon = Game.res.getSpriteFrame(data.ITEMNEEDED);
                PanelManager.instance.openPanel('use_item', useMethod, text, icon)
                    .then(() => PanelManager.instance.onPanelClosed('use_item', () => resolve(false)))
                    .catch(reject);
            } else {
                PanelManager.instance.openPanel('notice').then(() => {
                    PanelManager.instance.onPanelClosed('notice', () => resolve(false));
                }, reject);
            }
        }
    },
});
