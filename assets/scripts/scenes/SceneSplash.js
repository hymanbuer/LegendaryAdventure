
cc.Class({
    extends: cc.Component,

    properties: {
        splashAnimation: cc.Animation,
    },

    start () {
        cc.director.preloadScene('main');
        this.splashAnimation.on('finished', () => {
            cc.director.loadScene('main');
        });
        this.splashAnimation.play();
    },
});
