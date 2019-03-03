
const LoaderHelper = require('CCLoaderHelper');
const AudioManager = require('AudioManager');

const PanelManager = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        uiMaskPrefab: cc.Prefab,
        loadingTipsPrefab: cc.Prefab,
        panelConfig: cc.JsonAsset,
    },

    onLoad () {
        PanelManager.instance = this;
        this._reset();
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, this._reset, this);
    },

    onDestroy () {
        PanelManager.instance = undefined;
    },

    openPanel (name, ...args) {
        const config = this._getPanelConfig(name);
        if (!config || !config.uuid) {
            const msg = !config ? `can not find ${name}'s config` : `${name} should specify uuid`;
            return Promise.reject(msg);
        }

        if (config.singleton) {
            const root = this._findPanel(name);
            if (root) {
                if (root.panel) {
                    root.panel.emit('run', ...args);
                } else {
                    root.once('panel-loaded', panel => panel.emit('run', ...args));
                }
                return Promise.resolve(root.id);
            }
        }

        const root = new cc.Node();
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas).node;
        root.zIndex = cc.macro.MAX_ZINDEX;
        root.parent = canvas;
        root.width = canvas.width, root.height = canvas.height;
        root.name = name;
        root.id = this._nextPanelId++;
        if (config.blockInput) {
            root.addComponent(cc.BlockInputEvents);
        }
        this._panelMap.set(root.id, root);

        const addLoadingTips = () => {
            if (cc.isValid(root) && this.loadingTipsPrefab) {
                const loadingTips = cc.instantiate(this.loadingTipsPrefab);
                loadingTips.parent = root;
                root.loadingTips = loadingTips;
            }
        };
        const removeLoadingTips = () => {
            if (root.loadingTips) {
                root.loadingTips.destroy();
                root.loadingTips = undefined;
            }
            this.unschedule(addLoadingTips);
        }
        this.scheduleOnce(addLoadingTips, 0.05);
    
        return LoaderHelper.loadResByUuid(config.uuid).then(prefab => {
            let uiMask;
            if (!config.isHideMask && this.uiMaskPrefab) {
                uiMask = cc.instantiate(this.uiMaskPrefab);
                uiMask.parent = root;
            }

            const panel = cc.instantiate(prefab);
            panel.parent = root;
            panel.emit('run', ...args);
            if (uiMask) {
                uiMask.on('touchend', () => panel.emit('touch-mask'));
            }
            root.panel = panel;
            root.emit('panel-loaded', panel);
            root.on('child-removed', child => child === panel && this.closePanelById(root.id));

            const onShow = () => {
                if (uiMask) {
                    uiMask.active = true;
                }
                removeLoadingTips();
            };
            if (!config.showOnLoad) {
                if (uiMask) {
                    uiMask.active = false;
                }
                panel.active = false;
                panel.once('active-in-hierarchy-changed', onShow, this);
            } else {
                onShow();
            }

            AudioManager.instance.checkAddDefaultClickClip(panel);
            
            return root.id;
        }, 
        err => {
            removeLoadingTips();
            this._panelMap.delete(root.id);
            return `failed to load ${name}: ${err}`;
        });
    },

    closePanel (name) {
        for (let panel of this._panelMap.values()) {
            if (panel.name === name) {
                this._panelMap.delete(panel.id);
                panel.destroy();
                this.node.emit('panel-closed', name, panel.id);
            }
        }
    },

    closePanelById (panelId) {
        const panel = this._panelMap.get(panelId);
        if (panel) {
            this._panelMap.delete(panelId);
            panel.destroy();
            this.node.emit('panel-closed', panel.name, panel.id);
        }
    },

    hasPanel (name) {
        return name ? !!this._findPanel(name) : this._panelMap.size > 0;
    },

    sendToPanel (name, msg, ...args) {
        for (let panel of this._panelMap.values()) {
            if (panel.name === name) {
                panel.emit(msg, ...args);
            }
        }
    },

    sendToAll (msg, ...args) {
        for (let panel of this._panelMap.values()) {
            panel.emit(msg, ...args);
        }
    },

    //////////////////////////////////////////////////////////////////

    _findPanel (name) {
        for (let panel of this._panelMap.values()) {
            if (panel.name === name) {
                return panel;
            }
        }
    },

    _getPanelConfig (name) {
        const defaultConfig = this.panelConfig.json.default || {};  
        cc.js.addon(defaultConfig, {
            "isHideMask": false,
            "blockInput": true,
            "singleton": true,
            "showOnLoad": true,
        });

        const panels = this.panelConfig.json.panels || {};
        const info = panels[name];
        if (info) {
            cc.js.addon(info, defaultConfig);
        }
        return info;
    },

    _reset () {
        this._panelMap = new Map();
        this._nextPanelId = 0;
    },
});