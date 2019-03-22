
const EventTrigger = require('EventTrigger');

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

    onBeforeEnter (sender, passCallback) {
        passCallback(this.isBeforeEnterPass);
        this._handleEvent('doBeforeEnter', sender);
    },

    onAfterEnter (sender, passCallback) {
        passCallback(this.isAfterEnterPass);
        this._handleEvent('doAfterEnter', sender);
    },

    onBeforeExit (sender, passCallback) {
        passCallback(this.isBeforeExitPass);
        this._handleEvent('doBeforeExit', sender);
    },

    onAfterExit (sender, passCallback) {
        passCallback(this.isAfterExitPass);
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
        const eventTriggeres = this.getComponents(EventTrigger);
        eventTriggeres.forEach(trigger => {
            handlers.push(trigger[handleName].bind(trigger, sender));
        });
        handlers.push(this[handleName].bind(this, sender));
        async.series(handlers, (err, results) => {
            cc.log(handleName, err || '', results);
        });
    },
});
