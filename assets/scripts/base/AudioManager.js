
const AudioManager = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        defaultClickClip: {
            type: cc.AudioClip,
            default: null,
        },

        defaultClickVolume: 1.0,

        muteAudio: {
            get: function () {
                return this._muteAudio || false;
            },
            set: function (value) {
                if (value === this._muteAudio) {
                    return;
                }
                this._muteAudio = value;
                this.checkMuteAudio();
            },
        },
    },

    onLoad () {
        AudioManager.instance = this;
    },

    onDestroy () {
        AudioManager.instance = null;
    },

    checkAddDefaultClickClip (node) {
        const check = comps => {
            comps.map(comp => comp.node)
                .filter(node => !node.getComponent(cc.AudioSource))
                .forEach(node => {
                    const source = node.addComponent(cc.AudioSource);
                    source.clip = this.defaultClickClip;
                    source.volume = this.defaultClickVolume;
                    source.mute = this.muteAudio;
                    node.on('click', () => cc.isValid(source) && source.play());
                });
        }

        node = node || cc.director.getScene();
        check(node.getComponentsInChildren(cc.Button));
    },

    checkMuteAudio (node) {
        node = node || cc.director.getScene();
        node.getComponentsInChildren(cc.AudioSource).forEach(src => src.mute = this.muteAudio);
    },
});

cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, (scene) => {
    if (AudioManager.instance) {
        AudioManager.instance.checkAddDefaultClickClip(scene);
        AudioManager.instance.checkMuteAudio(scene);
    }
});
