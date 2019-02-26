
const BaseEntity = require('BaseEntity');
const UiManager = require('UiManager');
const UiGoFight = require('UiGoFight');
const MapState = require('MapState');

cc.Class({
    extends: BaseEntity,

    properties: {
        
    },

    onLoad () {

    },

    onDestroy () {
        MapState.instance.removeEntity(this.floorId, this.grid);
    },

    doBeforeEnter () {
        return new Promise((resolve, reject) => {
            UiManager.instance.showUi('prefabs/ui_gofight').then(ui => {
                const uiGoFight = ui.getComponent(UiGoFight);
                uiGoFight.init(this.floorId, this.gid);
                ui.ondestroy = ()=> {
                    this.node.destroy();
                };
                resolve(false);
            }, reject);
        });
    },
});
