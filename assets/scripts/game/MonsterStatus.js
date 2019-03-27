
cc.Class({
    extends: cc.Component,

    properties: {
        gid: 0,
        message: '',
        hp: 0,
        maxHp: 0,
        attack: 0,
        defence: 0,
        criticalPos: 7,
        criticalLength: 1.2,
        cursorMoveDuration: 1.0,

        exp: 0,
        gold: 0,
        item: 0,
    },
});