
const exports = module.exports = {};

exports.createNpcMap = function(atlas) {
    const framesMap = new Map();
    for (const frame of atlas.getSpriteFrames()) {
        if (!frame.name.startsWith('P_')) continue;

        const match = frame.name.match(/\d+/);
        if (!match) continue;

        const id = Number.parseInt(match[0]);
        let frames = framesMap.get(id);
        if (!frames) {
            frames = [];
            framesMap.set(id, frames);
        }
        frames.push(frame);
    }

    function get (id) {
        const config = {};
        config.name = 'default';
        config.spriteFrames = framesMap.get(id);
        return config;
    }

    return {
        get,
    };
}

const itemClipsMap = new Map();
itemClipsMap.set(151, [
    {name: 'default', frames: ['Blood']},
]);
itemClipsMap.set(152, [
    {name: 'default', frames: ['redgem']},
]);
itemClipsMap.set(153, [
    {name: 'default', frames: ['redgem']},
]);
itemClipsMap.set(154, [
    {name: 'default', frames: ['bluegem']},
]);
itemClipsMap.set(155, [
    {name: 'default', frames: ['yellowkey']},
]);
itemClipsMap.set(156, [
    {name: 'default', frames: ['bluekey']},
]);
itemClipsMap.set(157, [
    {name: 'default', frames: ['redkey']},
]);
itemClipsMap.set(159, [
    {name: 'default', frames: ['mirror']},
]);
itemClipsMap.set(351, [
    {name: 'default', frames: ['yellowdoor']},
    {name: 'open', frames: ['yellowdoor1', 'yellowdoor2', 'yellowdoor3']}
]);
itemClipsMap.set(354, [
    {name: 'default', frames: ['buledoor']},
    {name: 'open', frames: ['bluedoor1', 'bluedoor2', 'bluedoor3']}
]);
itemClipsMap.set(357, [
    {name: 'default', frames: ['reddoor']},
    {name: 'open', frames: ['reddoor1', 'reddoor2', 'reddoor3']}
]);
itemClipsMap.set(401, [
    {name: 'default', frames: ['box1']},
]);
itemClipsMap.set(403, [
    {name: 'default', frames: ['bombdoor']},
]);
itemClipsMap.set(405, [
    {name: 'default', frames: ['stonesword1']},
]);
itemClipsMap.set(406, [
    {name: 'default', frames: ['stonesword2']},
]);
itemClipsMap.set(408, [
    {name: 'default', frames: ['stand']},
    {name: 'down', frames: ['stand_down']}
]);
itemClipsMap.set(409, [
    {name: 'default', frames: ['standopen']},
    {name: 'open', frames: ['standopen1', 'standopen2', 'standopen3']}
]);
itemClipsMap.set(410, [
    {name: 'default', frames: ['swordblock00']},
]);



exports.createItemMap = function(atlas) {
    const framesMap = new Map();
    for (const [gid, clips] of itemClipsMap) {
        const configs = [];
        for (const clip of clips) {
            const config = {};
            config.name = clip.name;
            config.spriteFrames = [];
            for (const frame of clip.frames) {
                config.spriteFrames.push(atlas.getSpriteFrame(frame));
            }
            configs.push(config);
        }
        framesMap.set(gid, configs);
    }

    function get (id) {
        return framesMap.get(id);
    }

    return {
        get,
    };
}