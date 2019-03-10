
const exports = module.exports = {};

const encryptjs = require('encryptjs');
const secretkey = '408e5c63-4c22-4560-b94f-d0641712455e';
const openEncrypt = !CC_DEBUG;
const prefix = 'LA_';

function encrypt(plainText) {
    return encryptjs.encrypt(plainText, secretkey, 256);
}

function decrypt(cipherText) {
    return encryptjs.decrypt(cipherText, secretkey, 256);
}

function prefixKey(key) {
    return prefix + key;
}

exports.setItem = function (key, value) {
    if (!key || value === undefined) {
        return;
    }
    
    value = JSON.stringify(value);
    value = openEncrypt ? encrypt(value) : value;
    cc.sys.localStorage.setItem(prefixKey(key), value);
};

exports.getItem = function (key, defaultValue) {
    if (!key) {
        return defaultValue;
    }

    let value = cc.sys.localStorage.getItem(prefixKey(key));
    if (!value) {
        return defaultValue;
    }

    try {
        value = openEncrypt ? decrypt(value) : value;
        return JSON.parse(value);
    } catch (err) {
        return defaultValue
    }
}

exports.removeItem = function (key) {
    cc.sys.localStorage.removeItem(prefixKey(key));
}

exports.clear = function () {
    cc.sys.localStorage.clear();
}