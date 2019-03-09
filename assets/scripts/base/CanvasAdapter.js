
function onResize() {
    const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
    if (!canvas) return;

    const designSize = cc.view.getDesignResolutionSize();
    const frameSize = cc.view.getFrameSize();
    canvas.fitHeight = false;
    canvas.fitWidth = false;
    if (frameSize.width/frameSize.height >= designSize.width/designSize.height) {
        canvas.fitHeight = true;
    } else {
        canvas.fitWidth = true;
    }
}

/**
 * 随着屏幕尺寸改变，改变Canvas适配方式，fitHeight或fitWidth
 */
cc.Class({
    extends: cc.Component,

    onLoad () {
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, onResize);
        onResize();
    },

    onDestroy () {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, onResize);
    },
});