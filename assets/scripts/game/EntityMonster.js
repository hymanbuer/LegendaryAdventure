
const BaseEntity = require('BaseEntity');
const PanelManager = require('PanelManager');
const PanelGoFight = require('PanelGoFight');
const Game = require('Game');

cc.Class({
    extends: BaseEntity,

    properties: {
        
    },

    onLoad () {

    },

    onDestroy () {
        if (Game.mapState) {
            Game.mapState.removeEntity(this.floorId, this.grid);
        }
    },

    doBeforeEnter () {
        return new Promise((resolve, reject) => {
            return PanelManager.instance.openPanel('gofight', this.floorId, this.gid)
                .then(() => PanelManager.instance.onPanelClosed('gofight', () => {
                    this.node.destroy();
                    resolve(false);
                }))
                .catch(reject);
        });
    },
});
