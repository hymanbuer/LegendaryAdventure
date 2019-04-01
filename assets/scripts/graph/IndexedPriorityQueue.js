
const DEFAULT_COMPARE = () => true;

class IndexedPriorityQueue {
    constructor (compare, maxSize) {
        compare = typeof compare === 'function' && compare || DEFAULT_COMPARE;
        this._maxSize = typeof maxSize === 'number' && maxSize || 0;
        this._size = 0;
        this._indexHeap = new Array(maxSize + 1);
        this._nodeHeap = new Array(maxSize + 1);
        this._compare = (a, b) => compare(this._indexHeap[a], this._indexHeap[b]);
    }

    get size () { return this._size; }

    set (index) {
        if (index < 0) throw new Error(`expected: index >= 0, but ${index}`);

        if (this.exist(index)) {    // update
            this._reorderUpwards(this._nodeHeap[index]);
        } else {    // insert
            this._indexHeap[++this._size] = index;
            this._nodeHeap[index] = this._size;
            this._reorderUpwards(this._size);
        }
    }

    pop () {
        if (this._size === 0) return;

        const topIndex = this._indexHeap[1];
        this._swap(1, this._size);
        this._remove(this._indexHeap[this._size]);
        this._reorderDownwards(1);
        return topIndex
    }

    clear (list) {
        if (list) {
            for (const index of list) if (this.exist(index)) this._remove(index);
        } else {
            this._size = 0;
            this._indexHeap.fill(null);
            this._nodeHeap.fill(null);
        }
    }

    exist (index) {
        return !!this._nodeHeap[index];
    }

    // --------- private methods ----------

    _remove (index) {
        this._indexHeap[this._nodeHeap[index]] = null;
        this._nodeHeap[index] = null;
        --this._size;
    }

    _swap (node1, node2) {
        const temp = this._indexHeap[node1];
        this._indexHeap[node1] = this._indexHeap[node2];
        this._indexHeap[node2] = temp;

        this._nodeHeap[this._indexHeap[node1]] = node1;
        this._nodeHeap[this._indexHeap[node2]] = node2;
    }

    _reorderUpwards (node) {
        const parentOf = child => Math.floor(child / 2);
        while (node > 1 && this._compare(parentOf(node), node)) {
            const parent = parentOf(node);
            this._swap(parent, node);
            node = parent;
        }
    }

    _reorderDownwards (node) {
        while (2*node <= this._size) {
            let child = 2 * node;
            if (child < this._size && this._compare(child, child + 1)) {
                ++child;
            }
            if (this._compare(node, child)) {
                this._swap(child, node);
                node = child;
            } else {
                break;
            }
        }
    }
}

module.exports = IndexedPriorityQueue;