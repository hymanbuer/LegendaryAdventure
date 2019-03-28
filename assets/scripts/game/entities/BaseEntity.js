
cc.Class({
    extends: cc.Component,

    properties: {
        gid: 0,
        floorId: 0,
        grid: cc.Vec2,

        isBeforeEnterPass: false,
        isAfterEnterPass: true,
        isBeforeExitPass: true,
        isAfterExitPass: true,
    },

    onBeforeEnter (sender) {
        this._handleEvent('doBeforeEnter', sender);
    },

    onAfterEnter (sender) {
        this._handleEvent('doAfterEnter', sender);
    },

    onBeforeExit (sender) {
        this._handleEvent('doBeforeExit', sender);
    },

    onAfterExit (sender) {
        this._handleEvent('doAfterExit', sender);
    },

    doBeforeEnter (sender, callback) {
        callback(null);
    },

    doAfterEnter (sender, callback) {
        callback(null);
    },

    doBeforeExit (sender, callback) {
        callback(null);
    },

    doAfterExit (sender, callback) {
        callback(null);
    },

    _handleEvent (handleName, sender) {
        const wrap = handler => {
            return callback => {
                if (cc.isValid(this.node)) {
                    handler(callback);
                } else {
                    callback('node has been removed');
                }
            };
        };
        
        const handlers = [];
        const events = this.getComponents('BaseEvent');
        events.forEach(event => {
            const handler = event[handleName].bind(event, sender);
            handlers.push(wrap(handler));
        });
        handlers.push(wrap(this[handleName].bind(this, sender)));
        async.series(handlers, (err, results) => {
            if (err) {
                cc.log(err);
            } else {
                cc.log(handleName, results);
            }
        });
    },
});
