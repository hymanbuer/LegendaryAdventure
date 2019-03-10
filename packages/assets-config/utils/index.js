"use strict";

function _getPropertyDescriptor (obj, name) {
    while (obj) {
        var pd = Object.getOwnPropertyDescriptor(obj, name);
        if (pd) {
            return pd;
        }
        obj = Object.getPrototypeOf(obj);
    }
    return null;
}

function _copyprop(name, source, target) {
    var pd = _getPropertyDescriptor(source, name);
    Object.defineProperty(target, name, pd);
}

let dumpDepth = 3;
function dump(...args) {
    function doDump(obj, depth) {
        if (typeof obj === 'object') {
            if (depth >= dumpDepth) {
                return '...';
            } else {
                const ret = {};
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        ret[key] = doDump(obj[key], depth + 1);
                    } else {
                        _copyprop(key, obj, ret);
                    }
                }
                return ret;
            }
        } else {
            return obj;
        }
    }

    return args.map(arg => doDump(arg, 0));
}

exports.setDumpDepth = function (depth) {
    if (depth > 0) {
        dumpDepth = depth;
    }
};

exports.xxlog = function (...args) {
    if (args.length > 0) {
        const arr = dump(...args);
        Editor.Ipc.sendToMain('editor:renderer-console-log', ...arr);
    }
};