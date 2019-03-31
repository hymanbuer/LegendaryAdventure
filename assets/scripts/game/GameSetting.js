
const localStorage = require('LocalStorage');

exports.isAudioOn = true;
exports.isDoubleExp = false;
exports.isDoubleGold = false;

exports.load = function () {
    Object.assign(this, localStorage.getItem('GameSetting', {}));
};

exports.save = function () {
    localStorage.setItem('GameSetting', this);
};

exports.reset = function () {
    exports.isAudioOn = true;
    exports.isDoubleExp = false;
    exports.isDoubleGold = false;
};