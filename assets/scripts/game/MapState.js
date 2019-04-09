
const GameConfig = require('GameConfig');

function getGridKey(grid) {
    return `${grid.x}, ${grid.y}`;
}

cc.Class({
    mixins: [cc.EventTarget],

    ctor () {
        this._mapStateList = new Array(GameConfig.maxFloors);
    },

    load (mapState) {
        if (mapState == null) {
            return;
        }
        mapState.forEach((floorState, floorId) => floorState && floorState.forEach(gridState => {
            this._setEntityState(floorId, gridState.gridKey, gridState.state);
        }));
    },

    dump () {
        const mapStateList = new Array(GameConfig.maxFloors);
        this._mapStateList.forEach((mapState, floorId) => {
            const floorState = [];
            for (let [gridKey, state] of mapState.entries()) {
                const gridState = {gridKey, state};
                floorState.push(gridState);
            }
            mapStateList[floorId] = floorState;
        });
        return mapStateList;
    },

    isEntityRemoved (floorId, grid) {
        const state = this.getEntityState(floorId, grid);
        return state && state === 0;
    },

    removeEntity (floorId, grid) {
        this.setEntityState(floorId, grid, 0);
    },

    getEntityState (floorId, grid) {
        const gridKey = getGridKey(grid);
        if (!this._mapStateList[floorId] || !this._mapStateList[floorId].has(gridKey))
            return null;
        
        return this._mapStateList[floorId].get(gridKey);
    },

    setEntityState (floorId, grid, state) {
        const gridKey = getGridKey(grid);
        this._setEntityState(floorId, gridKey, state);
    },

    _setEntityState (floorId, gridKey, state) {
        let mapState = this._mapStateList[floorId];
        if (!mapState) {
            mapState = this._mapStateList[floorId] = new Map();
        }
        mapState.set(gridKey, state);
    },
});
