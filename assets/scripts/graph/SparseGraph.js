
module.exports = class SparseGraph {
    constructor () {
        this._nextNodeIndex = 0;
        this._nodes = [];
        this._edgeLists = [];
    }

    get nextNodeIndex () { return this._nextNodeIndex; }

    getNode (index) {
        return this._nodes[index];
    }

    getEdge (from, to) {
        const list = this._edgeLists[from];
        const index = list.findIndex(edge => edge.to === to);
        return index >= 0 && list[index] || null;
    }

    addNode (node) {
        cc.assert(typeof node === 'object' && typeof node.index === 'number');
        if (node.index < this._nodes.length) {
            cc.assert(!this.isNodeActive(node.index));
            this._nodes[node.index] = node;
        } else {
            cc.assert(node.index === this._nextNodeIndex);
            this._nodes.push(node);
            this._edgeLists.push([]);
            ++this._nextNodeIndex;
        }
    }

    removeNode (node) {
        cc.assert(typeof node === 'object' && typeof node.index === 'number');
        this.removeNodeByIndex(node.index);
    }

    removeNodeByIndex (index) {
        cc.assert(index < this._nodes.length);
        this._nodes[index] = null;
        this._edgeLists[index] = [];
        this._edgeLists.forEach(list => {
            const i = list.findIndex(edge => edge.to === index);
            if (i >= 0) list.splice(i, 1);
        });
    }

    addEdge (edge) {
        const from = edge.from, to = edge.to;
        cc.assert(from < this._nextNodeIndex && to < this._nextNodeIndex);
        if (!this.isEdgeActive(from, to)) {
            this._edgeLists[from].push(edge);
        }
    }

    removeEdge (edge) {
        cc.assert(typeof edge === 'object' && typeof edge.from === 'number');
        this.removeEdgeByIndex(edge.from, edge.to);
    }

    removeEdgeByIndex (from, to) {
        cc.assert(from < this._nextNodeIndex && to < this._nextNodeIndex);
        const list = this._edgeLists[from] || [];
        const index = list.findIndex(edge => edge.to === to);
        if (index >= 0) list.splice(index, 1);
    }

    getNumNodes () {
        return this._nodes.length;
    }

    getNumActiveNodes () {
        return this._nodes.filter(node => !!node).length;
    }

    getNumEdges () {
        let count = 0;
        this._edgeLists.forEach(list => count += list.length);
        return count;
    }

    isNodeActive (index) {
        return !!this.getNode(index);
    }

    isEdgeActive (from, to) {
        return this.isNodeActive(to) && !!this.getEdge(from, to);
    }

    getEdgeCost (from, to) {
        const edge = this.getEdge(from, to);
        return edge && edge.cost;
    }

    getNodeNeighbors (index) {
        cc.assert(index < this._nodes.length);
        return this._edgeLists[index].map(edge => edge.to);
    }

    toString (func = index => index) {
        const ret = [];
        ret.push('nodes:');
        ret.push(this._nodes.map(node => node ? func(node.index) : 'x').join(' '));
        ret.push('edges:');
        this._edgeLists.forEach((list, from) => {
            const fromStr = `${func(from)} -> `;
            const toStr = list.reduce((a, edge) => a += ` ${func(edge.to)}`, '');
            ret.push(fromStr + toStr);
        });
        return ret.join('\n');
    }
}