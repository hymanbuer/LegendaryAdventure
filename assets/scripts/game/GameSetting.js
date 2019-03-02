
const localStorage = require('LocalStorage');

exports.isAudioOn = true;

exports.load = function () {
    Object.assign(this, localStorage.getItem('GameSetting', {}));
};

exports.save = function () {
    localStorage.setItem('GameSetting', this);
};