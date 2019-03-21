
const EventCenter = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        
    },

    onLoad () {
        EventCenter.instance = this;
        this._sceneNode = new cc.Node();
        this._sceneNode.parent = this.node;
    },

    onDestroy () {
        EventCenter.instance = null;
    },

    on () {

    },

    off () {

    },

    emit () {

    },

    offSceneEvent () {

    },

    _getEventType (eventName) {
        const index = eventName.indexOf(':');
        if (index !== -1) {
            return eventName.substring(0, index);
        }
        return null;
    },
});

cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, (scene) => {
    if (EventCenter.instance) {
        EventCenter.instance.checkAddDefaultClickClip(scene);
        EventCenter.instance.checkMuteAudio(scene);
    }
});
