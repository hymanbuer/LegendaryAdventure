
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
        this._check(this.node.getComponents(cc.Button));
        this._check(this.node.getComponentsInChildren(cc.Button));
    },

    _check (comps) {
        comps.map(comp => comp.node)
            .filter(node => !node.getComponent(cc.AudioSource))
            .forEach(node => {
                const source = node.addComponent(cc.AudioSource);
                source.clip = this.clickClip;
                source.volume = this.clickVolumne;
                node.on('click', () => cc.isValid(source) && source.play());
            });
    },
});
