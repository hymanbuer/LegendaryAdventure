
const FOUR_DIRECTIONS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];

const EIGHT_DIRECTIONS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
];

class GridNode {
    constructor (index, x, y) {
        this._index = index;
        this._x = x;
        this._y = y;
    }

    get index () { return this._index; }
    get x () { return this._x; }
    get y () { return this._y; }
}

class GridGraph {
    constructor (size, grids, isDiagonal) {
        this._maxRows = size.height;
        this._maxColumns = size.width;
        this._isDiagonal = !!isDiagonal;
        this._nodes = new Array(this.maxSize + 1);
        for (const grid of grids)
            this._addNodeByGrid(grid.x, grid.y);
    }

    get maxRows () { return this._maxRows; }
    get maxColumns () { return this._maxColumns; }
    get isDiagonal () { return this._isDiagonal; }

    get maxSize () {
        return this._maxRows * this._maxColumns;
    }

    grid2index (x, y) {
        return y * this._maxColumns + x;
    }

    index2grid (index) {
        const x = index % this._maxColumns;
        const y = Math.floor(index / this._maxColumns);
        return {x, y};
    }

    getNodeByIndex (index) {
        return this._nodes[index];
    }

    getNodeByGrid (x, y) {
        const index = this.grid2index(x, y);
        return this.getNodeByIndex(index);
    }

    addNodeByGrid (x, y) {
        const node = this._addNodeByGrid(x, y);
        this._disconnectNode(node);
        return node;
    }

    removeNodeByGrid (x, y) {
        const index = this.grid2index(x, y);
        this._disconnectNode(this._nodes[index]);
        this._nodes[index] = null;
    }

    getEdgeCost (from, to) {
        // const [x1, y1, x2, y2] = indexes2grids(this, from, to); 
        // return x1 !== x2 && y1 !== y2 ? Math.SQRT2 : 1;
        return 1;
    }

    getNodeNeighbors (index) {
        const node = this._nodes[index];
        if (!node) return [];

        if (node.neighbors)
            return node.neighbors;
        else
            return node.neighbors = this._neighbors(index);
    }

    toString () {
        const ret = [];
        for (let y = 0; y < this._maxRows; ++y) {
            const rowStr = [];
            for (let x = 0; x < this._maxColumns; ++x) {
                const node = this.getNodeByGrid(x, y);
                rowStr.push(node ? '0' : '1');
            }
            ret.push(rowStr.join(' '));
        }
        return ret.join('\n');
    }

    // ----------------

    _neighbors (index) {
        const node = this._nodes[index];
        const directions = this._isDiagonal ? EIGHT_DIRECTIONS : FOUR_DIRECTIONS;
        const neighbors = [];
        for (const direction of directions) {
            const x = node.x + direction[0];
            const y = node.y + direction[1];
            if (x < 0 || x >= this._maxColumns || y < 0 || y >= this._maxRows)
                continue;

            const neighborIndex = this.grid2index(x, y);
            const neighbor = this._nodes[neighborIndex];
            if (neighbor) neighbors.push(neighborIndex);
        }
        return neighbors;
    }

    _addNodeByGrid (x, y) {
        const index = this.grid2index(x, y);
        this._nodes[index] = new GridNode(index, x, y);
        return this._nodes[index];
    }

    _disconnectNode (node) {
        for (let neighbor of this._neighbors(node.index))
            this._nodes[neighbor].neighbors = null;
    }
}

module.exports = GridGraph;