
const setting = require('GameSetting');

cc.Class({
    extends: cc.Component,

    properties: {
        soundForbidClick: {
            default: null,
            type: cc.AudioClip,
        },
        soundRun: {
            default: null,
            type: cc.AudioClip,
        },
        soundOpenBag: {
            default: null,
            type: cc.AudioClip,
        },
        soundOpenBox: {
            default: null,
            type: cc.AudioClip,
        },
        soundOpenDoor: {
            default: null,
            type: cc.AudioClip,
        },
        soundCloseBag: {
            default: null,
            type: cc.AudioClip,
        },
        soundGetKey: {
            default: null,
            type: cc.AudioClip,
        },
        soundGetBlood: {
            default: null,
            type: cc.AudioClip,
        },
        soundGetGem: {
            default: null,
            type: cc.AudioClip,
        },
        soundGetItem: {
            default: null,
            type: cc.AudioClip,
        },
        soundChangeFloor: {
            default: null,
            type: cc.AudioClip,
        },  
    },

    onLoad () {
        this._initSound();
        this._initMusic();
        
    },

    _initSound () {
        const map = this._soundMap = new Map();
        this._soundPlayingMap = new Map();
        map.set('forbid-click', this.soundForbidClick);
        map.set('run', this.soundRun);
        map.set('open-bag', this.soundOpenBag);
        map.set('open-box', this.soundOpenBox);
        map.set('open-door', this.soundOpenDoor);
        map.set('close-bag', this.soundCloseBag);
        map.set('get-key', this.soundGetKey);
        map.set('get-blood', this.soundGetBlood);
        map.set('get-gem', this.soundGetGem);
        map.set('get-item', this.soundGetItem);
        map.set('change-floor', this.soundChangeFloor);
    },

    _initMusic () {
        const map = this._musicUrlMap = new Map();
        map.set('main', 'audio/beginmusic');
        map.set('battle', 'audio/battlemusic');
        map.set('scene-0', 'audio/huayuanmusic');
        map.set('scene-1', 'audio/wanggongmusic');
        map.set('scene-2', 'audio/huayuanmusic');
        map.set('scene-3', 'audio/bingxueandhaichengmusic');
        map.set('scene-4', 'audio/mudimusic');
        map.set('scene-5', 'audio/lindimusic');
        map.set('scene-6', 'audio/bingxueandhaichengmusic');
        map.set('scene-7', 'audio/dongkumusic');
        map.set('scene-8', 'audio/jixiemusic');
        map.set('scene-9', 'audio/tiankongmusic');
        map.set('scene-10', 'audio/mofamusic');
    },

    onDestroy () {
        for (let audioId of this._soundPlayingMap.values()) {
            cc.audioEngine.stop(audioId);
        }
        this._soundPlayingMap.clear();
    },

    start () {
    },

    stopEffect (name) {
        const audioId = this._soundPlayingMap.get(name);
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
            this._soundPlayingMap.delete(name);
        }
    },

    isEffectPlaying (name) {
        const audioId = this._soundPlayingMap.get(name);
        return audioId != null 
            && cc.audioEngine.getState(audioId) == cc.audioEngine.AudioState.PLAYING;
    },

    playEffect (name, loop=false) {
        if (!setting.isAudioOn) {
            return;
        }
        if (this.isEffectPlaying(name)) {
            return;
        }

        const sound = this._soundMap.get(name);
        if (sound != null) {
            const audioId = cc.audioEngine.playEffect(sound, loop);
            this._soundPlayingMap.set(name, audioId);
        }
    },

    playMusic (name, loop=true) {
        if (!setting.isAudioOn) {
            return;
        }
        if (this._lastMusic == name) {
            return;
        }

        const url = this._musicUrlMap.get(name);
        if (url != null) {
            cc.loader.loadRes(url, cc.AudioClip, (err, clip) => {
                if (!err) {
                    cc.audioEngine.playMusic(clip, loop);
                    cc.audioEngine.setMusicVolume(0.7);
                    this._lastMusic = name;
                }
            });
        }
    },

    playMusicBySceneId (sceneId) {
        const name = `scene-${sceneId}`;
        this.playMusic(name, true);
    },
});
