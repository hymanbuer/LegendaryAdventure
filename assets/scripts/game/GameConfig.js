
/**
 * sceneId和floorId均从0开始计数
 */

cc.js.get(exports, 'maxSceneId', function () {
    return 10;
});

cc.js.get(exports, 'maxFloors', function () {
    return 101;
});

exports.getSceneId = function (floorId) {
    let sceneId = Math.floor(floorId / 10);
    if (floorId % 10 !== 0) {
        sceneId += 1;
    }
    cc.assert(sceneId <= 10, `floorId exceeds maxSceneId: ${sceneId}`);
    return sceneId;
};

exports.getFirstFloorOfScene = function (sceneId) {
    if (sceneId === 0) {
        return 0;
    } else {
        return (sceneId-1)*10 + 1;
    }
};

const sceneNames = [
    '前厅', 
    '王宫', '花园', '海城', '墓地', '森林', 
    '雪原', '洞窟', '机械', '天空', '魔域',
];
exports.getSceneName = function (sceneId) {
    return sceneNames[sceneId];
};

const specialMonsterSet = new Set([
    102, 103, 109, 110, 111,
    126, 127, 128, 129, 130, 131, 132, 133, 134,
]);
exports.isMonster = function (gid) {
    return (gid >= 226 && gid <= 329) || specialMonsterSet.has(gid);
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

const specialNpcSet = new Set([
    101, 104, 105, 106, 107,
]);
exports.isNpc = function (gid) {
    return (gid >= 1 && gid <= 22) || specialNpcSet.has(gid);
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
    401, 402, 405, 406, 416, 417, 418, 419, 421, 422, 423,
    23, 24,
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

const infiniteItemSet = new Set([
    176, 177, 178, 179, 180, 181,
    2001,
]);
exports.isInfiniteItem = function (gid) {
    return infiniteItemSet.has(gid);
};
