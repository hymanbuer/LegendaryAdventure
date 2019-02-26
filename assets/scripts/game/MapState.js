
const maxFloors = 105;

function gridKey(grid) {
    return `${grid.x}, ${grid.y}`;
}

const MapState = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
    },

    onLoad () {
        MapState.instance = this;
        this._mapStateList = new Array(maxFloors);
    },

    onDestroy () {
        MapState.instance = null;
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
