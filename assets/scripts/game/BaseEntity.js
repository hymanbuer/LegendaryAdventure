
const EventTrigger = require('EventTrigger');

cc.Class({
    extends: cc.Component,

    properties: {
        gid: 0,
        floorId: 0,
        grid: cc.Vec2,
    },

    onLoad () {

    },

    onBeforeEnter (resolve) {
        const eventTrigger = this.getComponent(EventTrigger);
        const p = eventTrigger ? eventTrigger.doBeforeEnter() : Promise.resolve();
        p.then(() => this.doBeforeEnter()).then(resolve);
    },

    onAfterEnter (resolve) {
        const eventTrigger = this.getComponent(EventTrigger);
        const p = eventTrigger ? eventTrigger.doAfterEnter() : Promise.resolve();
        p.then(()=> this.doAfterEnter())
         .then(resolve);
    },

    onAfterExit (resolve) {
        return this.doAfterExit().then(resolve);
    },

    doBeforeEnter () {
        return Promise.resolve(false);
    },

    doAfterEnter () {
        return Promise.resolve(true);
    },

    doAfterExit () {
        return Promise.resolve(true);
    }
});
