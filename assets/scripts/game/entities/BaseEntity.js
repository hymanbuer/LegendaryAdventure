
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
        const handlers = [];
        const eventTriggeres = this.getComponents('BaseEvent');
        eventTriggeres.forEach(trigger => {
            handlers.push(trigger[handleName].bind(trigger, sender));
        });
        handlers.push(this[handleName].bind(this, sender));
        async.series(handlers, (err, results) => {
            cc.log(handleName, err || '', results);
        });
    },
});
