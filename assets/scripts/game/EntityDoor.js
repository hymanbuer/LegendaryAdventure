
const BaseEntity = require('BaseEntity');
const PanelManager = require('PanelManager');
const PanelNotice = require('PanelNotice');
const PanelUseItem = require('PanelUseItem');
const Bag = require('Bag');
const DataCenter = require('DataCenter');
const EntityView = require('EntityView');
const Resources = require('Resources');
const MapState = require('MapState');

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
        const data = DataCenter.instance.getMonster(this.gid);
        if (data && data.ITEMNEEDED) {
            if (Bag.instance.hasItem(data.ITEMNEEDED)) {
                const useMethod = () => {
                    this._isRemoving = true;
                    Bag.instance.removeItem(data.ITEMNEEDED);
                    MapState.instance.removeEntity(this.floorId, this.grid);

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
                const icon = Resources.instance.getSpriteFrame(data.ITEMNEEDED);
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
