
const GameConfig = require('GameConfig');

function gridKey(grid) {
    return `${grid.x}, ${grid.y}`;
}

cc.Class({
    ctor () {
        this._mapStateList = new Array(GameConfig.maxFloors);
    },

    isEntityRemoved (floorId, grid) {
        const state = this.getEntityState(floorId, grid);
        return state && state === 0;
    },

    removeEntity (floorId, grid) {
        this.setEntityState(floorId, grid, 0);
    },

    getEntityState (floorId, grid) {
        const key = gridKey(grid);
        if (!this._mapStateList[floorId] || !this._mapStateList[floorId].has(key))
            return null;
        
        return this._mapStateList[floorId].get(key);
    },

    setEntityState (floorId, grid, state) {
        const key = gridKey(grid);
        let mapState = this._mapStateList[floorId];
        if (!mapState) {
            mapState = this._mapStateList[floorId] = new Map();
        }
        mapState.set(key, state);
    },
});
