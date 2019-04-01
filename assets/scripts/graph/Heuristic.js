
const Heuristic = module.exports = {};


const Type = cc.Enum({
    Manhattan: -1,
    Diagonal: -1,
    MaxDiagonal: -1,
});
Heuristic.Type = Type;

function indexes2grids(index2grid, index1, index2) {
    const grid1 = index2grid(index1);
    const grid2 = index2grid(index2);
    return [grid1.x, grid1.y, grid2.x, grid2.y];
}

Heuristic.create = function(type, index2grid) {
    switch (type) {
    case Type.Manhattan:
        return (index1, index2) => {
            const [x1, y1, x2, y2] = indexes2grids(index2grid, index1, index2);
            const d1 = Math.abs(x1 - x2);
            const d2 = Math.abs(y1 - y2);
            return d1 + d2;
        };

    case Type.Diagonal:
        return (index1, index2) => {
            const [x1, y1, x2, y2] = indexes2grids(index2grid, index1, index2);
            const D = 1;
            const D2 = Math.SQRT2;
            const d1 = Math.abs(x1 - x2);
            const d2 = Math.abs(y1 - y2);
            return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
        };

    case Type.MaxDiagonal:
        return (index1, index2) => {
            const [x1, y1, x2, y2] = indexes2grids(index2grid, index1, index2);
            const d1 = Math.abs(x1 - x2);
            const d2 = Math.abs(y1 - y2);
            return Math.max(d1, d2);
        };
    }
    cc.assert(false, 'invalid type');
}