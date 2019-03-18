
exports.fixedNumber = function (value, n) {
    const digits = [];
    while (n > 0) {
        digits.push(value % 10);
        value = Math.floor(value / 10);
        n -= 1;
    }
    digits.reverse();
    return digits.join('');
};

exports.create2dArray = function (width, height, defaultValue) {
    const ret = [];
    for (let i = 0; i < height; i++) {
        ret.push(new Array(width).fill(defaultValue));
    }
    return ret;
};

exports.fill2dArray = function (array, value) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[0].length; j++) {
            array[i][j] = value;
        }
    }
};
