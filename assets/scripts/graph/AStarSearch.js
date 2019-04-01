
const IndexedPQ = require('IndexedPriorityQueue');

class AStarSearch {
    /**
     * graph should has methods [getNodeNeighbors, getEdgeCost]
     * @param {Object} graph 
     * @param {Number} maxSize 
     * @param {Function} heuristic 
     */
    constructor (maxSize, getNeighbors, getEdgeCost, heuristic) {
        this._hMap = new Map();
        this._gCosts = new Array(maxSize + 1).fill(0);
        this._fCosts = new Array(maxSize + 1).fill(0);
        this._route = new Array(maxSize + 1).fill(0);
        this._closed = new Array(maxSize + 1).fill(false);
        this._visited = new Array(maxSize + 1).fill(false);
        this._dirty = new Array();
        this._pq = new IndexedPQ((index1, index2) => {
            return this._fCosts[index1] > this._fCosts[index2];
        }, maxSize);
        this._getNeighbors = getNeighbors;
        this._getEdgeCost = getEdgeCost;
        this._heuristic = heuristic;
        this.clear();
    }

    search (start, target) {
        this.clear();
        this._pq.set(start);
        this._start = this._closest = start;
        this._target = target;
        this._dirty.push(start)
        this._visited[start] = true;
        let closestH = this._hCost(start, target);
        let closestG = 0;
        while (this._pq.size > 0) {
            const current = this._pq.pop();
            if (current === target) {
                this._closest = this._target;
                return true;
            }

            this._closed[current] = true;
            for (const next of this._getNeighbors(current)) {
                if (this._closed[next]) continue;

                const g = this._gCosts[current] + this._getEdgeCost(current, next);
                if (!this._visited[next] || g < this._gCosts[next]) {
                    if (!this._visited[next]) this._dirty.push(next);

                    const h = this._hCost(next, target)
                    this._visited[next] = true;
                    this._gCosts[next] = g;
                    this._fCosts[next] = g + h;
                    this._route[next] = current;
                    this._pq.set(next);

                    if (h < closestH || (h === closestH && g < closestG)) {
                        this._closest = next;
                        closestH = h;
                        closestG = g;
                    }
                }
            }
        }
        return false;
    }

    get path () {
        if (this._start < 0 || this._closest === this._start)
            return [];

        const path = [];
        let node = this._closest;
        do {
            path.unshift(node);
            node = this._route[node];
        } while (node !== 0 && node !== this._start);

        return path;
    }

    clear () {
        this._start = -1;
        this._target = -1;
        this._closest = -1;
        for (const index of this._dirty) {
            this._gCosts[index] = 0;
            this._fCosts[index] = 0;
            this._route[index] = 0;
            this._closed[index] = false;
            this._visited[index] = false;
        }
        this._pq.clear(this._dirty);
        this._dirty = [];
    }

    _hCost (from, to) {
        // const key1 = `(${from}, ${to})`;
        // const key2 = `(${to}, ${from})`;
        // let h = this._hMap.get(key1) || this._hMap.get(key2);
        // if (!h) {
        //     h = this._heuristic(from, to);
        //     this._hMap.set(key1, h);
        //     this._hMap.set(key2, h);
        // }
        // return h;
        return this._heuristic(from, to);
    }
}

module.exports = AStarSearch;