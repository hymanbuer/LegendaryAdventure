
const exports = module.exports = {};

const encryptjs = require('encryptjs');
const secretkey = '408e5c63-4c22-4560-b94f-d0641712455e';
const openEncrypt = !CC_DEBUG;

function encrypt(plainText) {
    return encryptjs.encrypt(plainText, secretkey, 256);
}

function decrypt(cipherText) {
    return encryptjs.decrypt(cipherText, secretkey, 256);
}

exports.setItem = function (key, value) {
    if (!key || value === undefined)
        throw new Error(`invalid key or value: ${key}, ${value}`);

    value = JSON.stringify(value);
    value = openEncrypt ? encrypt(value) : value;
    cc.sys.localStorage.setItem(key, value);
};

exports.getItem = function (key, defaultValue) {
    if (!key)
        throw new Error(`invalid key: ${key}`);
    
    let value = cc.sys.localStorage.getItem(key);
    if (!value)
        return defaultValue;

    value = openEncrypt ? decrypt(value) : value;
    return JSON.parse(value);
}

exports.removeItem = function (key) {
    cc.sys.localStorage.removeItem(key);
}

exports.clear = function () {
    cc.sys.localStorage.clear();
}