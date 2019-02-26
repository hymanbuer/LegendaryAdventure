
cc.Class({
    extends: cc.Component,

    properties: {
        splashAnimation: cc.Animation,
    },

    start () {
        this.splashAnimation.on('finished', this.onSplashFinished, this);
        this.splashAnimation.play();
    },

    onSplashFinished () {
        cc.director.loadScene('main');
    },
});
