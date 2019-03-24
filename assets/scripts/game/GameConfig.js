
/**
 * sceneId和floorId均从0开始计数
 */

cc.js.get(exports, 'maxSceneId', function () {
    return 10;
});

exports.isBoss = function (gid) {
    return gid >= 126 && gid <= 134;
};

exports.getBossIndex = function (gid) {
    return gid - 126;
};

exports.isMonster = function (gid) {
    return gid >= 226 && gid <= 329;
};

exports.getMonsterIndex = function (gid) {
    return gid - 226;
};

const itemRanges = [
    [39, 50], [64, 75], [89, 100], [114, 125], [139, 193],
];
const itemSet = new Set([
    360,
]);
itemRanges.forEach(range => {
    for (let i = range[0]; i < range[1]; i++) {
        itemSet.add(i);
    }
});
exports.isItem = function (gid) {
    return itemSet.has(gid);
};

exports.isNpc = function (gid) {
    return (gid >= 1 && gid <= 22) || (gid >= 101 && gid <= 107);
};

exports.isPrincess = function (gid) {
    return gid >= 1 && gid <= 22;
};

const doorSet = new Set([
    351, 352, 353, 354, 355, 356, 357, 358, 359,
    410, 411, 412, 413, 414, 415,
    403, 404, 409, 821, 1001,
]);
exports.isDoor = function (gid) {
    return doorSet.has(gid);
};

const staticSet = new Set([
    401, 402, 405, 406, 416, 417, 418, 421, 422, 423,
]);
exports.isStaticItem = function (gid) {
    return staticSet.has(gid);
};

exports.isTrigger = function (gid) {
    return gid === 408;
};

const unknownSet = new Set([
    204,
]);
exports.isUnknown = function (gid) {
    return unknownSet.has(gid);
};
