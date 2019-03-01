
const localStorage = require('LocalStorage');
const setting = require('GameSetting');
const profile = require('GameProfile');

const Main = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        
    },

    onLoad () {
        cc.game.addPersistRootNode(this.node);
        Main.instance = this;
        this._init();
    },

    onDestroy () {
        Main.instance = null;
        cc.game.removePersistRootNode(this.node);
    },

    _init () {
        try {
            const setting = localStorage.getItem('GameSetting', {});
            GameSetting.init(setting);
        } catch (err) {
            cc.error(err.message);
            localStorage.clear();
        }
    },
});
