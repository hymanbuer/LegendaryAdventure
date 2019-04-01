
class DisjointSet {
    constructor (size) {
        this._data = new Array((Number(size) || 0) + 1);
        this._rank = new Array(this._data.length);
        this.reset();
    }

    make () {
        const index = this._data.length
        this._data[index] = index;
        this._rank[index] = 0;
        return index;
    }

    find (index) {
        if (index >= this._data.length) return -1;

        let root = index;
        while (this._data[root] !== root)
            root = this._data[root];

        while (this._data[index] != root) {
            const temp = this._data[index];
            this._data[index] = root;
            index = temp;
        }

        return root;
    }

    union (index1, index2) {
        const root1 = this.find(index1);
        const root2 = this.find(index2);
        if (root1 === -1 || root2 === -1 || root1 === root2) return;

        if (this._rank[root1] > this._rank[root2]) {
            this._data[root2] = root1;
        } else {
            this._data[root1] = root2;
            if (this._rank[root1] === this._rank[root2])
                ++this._rank[root2];
        }
    }

    same (index1, index2) {
        return this.find(index1) === this.find(index2);
    }

    reset () {
        for (let i = 0; i < this._data.length; ++i) {
            this._data[i] = i;
            this._rank[i] = 0;
        }
    }
}

module.exports = DisjointSet;