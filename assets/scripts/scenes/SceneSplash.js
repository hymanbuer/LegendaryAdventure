
const Main = require('Main');

cc.Class({
    extends: cc.Component,

    properties: {
        splash: cc.Node,
        clickTips: cc.Node,
    },

    start () {
        cc.director.preloadScene('main');
        this.clickTips.active = false;
        this.splash.opacity = 0;
        this.splash.runAction(cc.sequence(cc.fadeIn(0.5), cc.callFunc(() => {
            if (cc.sys.isBrowser) {
                this.clickTips.active = true;
                this.clickTips.runAction(cc.repeatForever(cc.blink(1, 1)));
                this.node.on('touchstart', ()=> {
                    Main.instance.transition('main');
                });
            } else {
                Main.instance.transition('main');
            }
        })));
    },
});
