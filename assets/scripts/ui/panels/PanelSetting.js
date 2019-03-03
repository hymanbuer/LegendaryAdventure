
const setting = require('GameSetting');
const AudioManager = require('AudioManager');
const Main = require('Main');

cc.Class({
    extends: cc.Component,

    properties: {
        audioToggle: cc.Toggle,
    },

    onLoad () {
        this.audioToggle.isChecked = setting.isAudioOn;
    },

    onDestroy () {
        if (!this.audioToggle.isChecked) {
            cc.audioEngine.stopAll();
        }
    },

    onClickClose () {
        this.node.destroy();
    },

    onClickSwitch (sender) {
        setting.isAudioOn = sender.isChecked;
        setting.save();
        AudioManager.instance.muteAudio = !sender.isChecked;
        if (sender.isChecked) {
            cc.audioEngine.pauseAll();
        } else {
            cc.audioEngine.resumeAll();
        }
    },

    onClickBackMain () {
        Main.instance.transition('main');
    },

    onClickGoldShop () {

    },

    onClickWeiboShare () {

    },
});
