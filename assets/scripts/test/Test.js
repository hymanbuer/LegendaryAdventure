

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    start () {
        async.series([
            this._call(1),
            this._call(2),
            this._call(3),
            this._call(4),
            this._call(5),
        ], (err, results) => {
            cc.log(err, results);
        })
    },

    _call (num) {
        return callback => {
            this.scheduleOnce(() => {
                cc.log('---', num);
                callback(null, num);
            }, num);
        }
    }
});
