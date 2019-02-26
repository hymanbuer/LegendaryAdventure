
const BaseEntity = require('BaseEntity');
const UiManager = require('UiManager');
const UiNotice = require('UiNotice');
const UiUseItem = require('UiUseItem');
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
                UiManager.instance.showUi('prefabs/ui_use_item').then(ui => {
                    const useItem = ui.getComponent(UiUseItem);
                    useItem.useMethod = ()=> {
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
                    useItem.text.string = data.MESSAGE || data.ASKMESSAGE;
                    useItem.icon.spriteFrame = Resources.instance.getSpriteFrame(data.ITEMNEEDED);

                    ui.ondestroy = ()=> {
                        resolve(false);
                    };
                }, reject);
            } else {
                UiManager.instance.showUi('prefabs/ui_notice').then(ui => {
                    const notice = ui.getComponent(UiNotice);
                    ui.ondestroy = ()=> {
                        resolve(false);
                    };
                }, reject);
            }
        }
    },
});
