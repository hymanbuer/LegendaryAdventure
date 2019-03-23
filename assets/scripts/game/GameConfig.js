
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