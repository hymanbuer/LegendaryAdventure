
const BaseEntity = require('BaseEntity');
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
                Game.openPanel('use_item', useMethod, text, icon)
                    .then(() => Game.onPanelClosed('use_item', () => resolve(false)))
                    .catch(reject);
            } else {
                Game.openPanel('notice').then(() => {
                    Game.onPanelClosed('notice', () => resolve(false));
                }, reject);
            }
        }
    },
});
