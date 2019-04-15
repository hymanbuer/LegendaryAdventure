
const setting = require('GameSetting');

cc.Class({
    extends: cc.Component,

    properties: {
        forbidClick: {
            default: null,
            type: cc.AudioClip,
        },
        run: {
            default: null,
            type: cc.AudioClip,
        },
        openBag: {
            default: null,
            type: cc.AudioClip,
        },
        openBox: {
            default: null,
            type: cc.AudioClip,
        },
        openDoor: {
            default: null,
            type: cc.AudioClip,
        },
        closeBag: {
            default: null,
            type: cc.AudioClip,
        },
        getKey: {
            default: null,
            type: cc.AudioClip,
        },
        getBlood: {
            default: null,
            type: cc.AudioClip,
        },
        getGem: {
            default: null,
            type: cc.AudioClip,
        },
        getItem: {
            default: null,
            type: cc.AudioClip,
        },
        changeFloor: {
            default: null,
            type: cc.AudioClip,
        },
        useBlood: {
            default: null,
            type: cc.AudioClip,
        },
        useBomb: {
            default: null,
            type: cc.AudioClip,
        },
        respawn: {
            default: null,
            type: cc.AudioClip,
        },
        levelUp: {
            default: null,
            type: cc.AudioClip,
        },
        lose: {
            default: null,
            type: cc.AudioClip,
        },
        win: {
            default: null,
            type: cc.AudioClip,
        },
        miss: {
            default: null,
            type: cc.AudioClip,
        },
        monsterAttack: {
            default: null,
            type: cc.AudioClip,
        },
        playerAttack: {
            default: null,
            type: cc.AudioClip,
        },
        playerCriticalAttack: {
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
        map.set('forbid-click', this.forbidClick);
        map.set('run', this.run);
        map.set('open-bag', this.openBag);
        map.set('open-box', this.openBox);
        map.set('open-door', this.openDoor);
        map.set('close-bag', this.closeBag);
        map.set('get-key', this.getKey);
        map.set('get-blood', this.getBlood);
        map.set('get-gem', this.getGem);
        map.set('get-item', this.getItem);
        map.set('change-floor', this.changeFloor);
        map.set('use-blood', this.useBlood);
        map.set('use-bomb', this.useBomb);
        map.set('respawn', this.respawn);
        map.set('level-up', this.levelUp);
        map.set('lose', this.lose);
        map.set('win', this.win);
        map.set('miss', this.miss);
        map.set('monster-attack', this.monsterAttack);
        map.set('player-attack', this.playerAttack);
        map.set('player-critical-attack', this.playerCriticalAttack);
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
        if (this._isEffectLoop(name)) {
            return;
        }

        const sound = this._soundMap.get(name);
        if (sound != null) {
            const audioId = cc.audioEngine.playEffect(sound, loop);
            this._soundPlayingMap.set(name, audioId);
        }
    },

    playMusic (name, loop=true) {
        if (this._lastMusic == name) {
            return;
        }

        const url = this._musicUrlMap.get(name);
        if (url != null) {
            cc.loader.loadRes(url, cc.AudioClip, (err, clip) => {
                if (!err) {
                    cc.audioEngine.playMusic(clip, loop);
                    cc.audioEngine.setMusicVolume(0.7);
                    if (!setting.isAudioOn) {
                        cc.audioEngine.pauseMusic();
                    }
                    this._lastMusic = name;
                }
            });
        }
    },

    playMusicBySceneId (sceneId) {
        const name = `scene-${sceneId}`;
        this.playMusic(name, true);
    },

    _isEffectLoop (name) {
        const audioId = this._soundPlayingMap.get(name);
        return audioId != null && cc.audioEngine.isLoop(audioId);
    },
});
