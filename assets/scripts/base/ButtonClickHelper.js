
/**
 * !#zh将自身及子节点拥有cc.Button的节点添加点击音效
 */
cc.Class({
    extends: cc.Component,

    properties: {
        clickClip: {
            type: cc.AudioClip,
            default: null,
        },

        clickVolumne: 1.0,
    },

    start () {
        this.node.getComponents(cc.Button)
            .map(comp => comp.node)
            .filter(node => !node.getComponent(cc.AudioSource))
            .forEach(node => {
                const source = node.addComponent(cc.AudioSource);
                source.clip = this.clickClip;
                source.volume = this.clickVolumne;
                node.on('click', () => cc.isValid(source) && source.play());
            });
    },
});
