
const LoaderHelper = require('CCLoaderHelper');
const World = require('World');

const Direction = cc.Enum({
    East: 0,
    South: 1,
    West: 2,
    North: 3,
});

const MotionState = cc.Enum({
    Stand: 0,
    Walk: 1,
});

cc.Class({
    extends: cc.Component,

    properties: {
        atlas: cc.SpriteAtlas,
        sprite: cc.Node,
        world: World,
        grid: cc.Vec2,
    },

    onLoad () {
        this._initAnimation();
    },

    start () {
        
    },

    followPath (grids = [], callback) {
        let isStop = false;
        const stop = () => {
            isStop = true;
            this._stand();
            if (typeof callback === 'function') callback();
        };

        const walkNext = next => {
            if (isStop || next >= grids.length) {
                stop();
                return;
            }

            const target = grids[next];
            const walk = ()=> {
                const move = this._moveTo(target, (success)=> {
                    if (!success) stop();
                });
                const end = cc.callFunc(()=> walkNext(next + 1));
                const action = cc.sequence(move, end);
                this.node.runAction(action);
            };

            const p = this.world.onBeforeEnter(target);
            this.rotateTo(target);
            if (p) {
                this._stand();
                p.then(success => success ? walk() : stop());
            }
            else walk();
        };

        this.node.stopAllActions();
        walkNext(0);
    },

    faceUp (isUp) {
        this._direction = isUp ? Direction.North : Direction.South;
        this._updateAnimation();
    },

    placeAt (target) {
        this.grid = target;
        this.node.position = this.world.getPositionAt(target);
        this.node.zIndex = target.y;
    },

    rotateTo (target, callback) {
        const action = this._rotateTo(target, callback);
        this.node.runAction(action);
    },

    moveTo (target, callback) {
        const action = this._moveTo(target, ()=> {
            this._stand();
            if (typeof callback === 'function') callback();
        });
        this.node.runAction(action);
    },

    stopMove () {
        this.node.stopAllActions();
        this._stand();
    },

    _rotateTo (target, callback) {
        if (target.x > this.grid.x) this._direction = Direction.East;
        else if (target.x < this.grid.x) this._direction = Direction.West;
        else if (target.y > this.grid.y) this._direction = Direction.South;
        else if (target.y < this.grid.y) this._direction = Direction.North;

        this._updateAnimation();
    
        return cc.callFunc(callback ? callback : ()=>{});
    },

    _moveTo (target, callback) {
        const oldPos = cc.v2(this.node.x, this.node.y);
        const oldGrid = this.grid;
        const targetPos = this.world.getPositionAt(target);
        const end = cc.callFunc(()=> {
            this.placeAt(target);
            this.world.onAfterExit(oldGrid);
            const p = this.world.onAfterEnter(target)
            if (p) {
                p.then(success => {
                    if (typeof callback === 'function') callback(success);
                });
            } else {
                if (typeof callback === 'function') callback(true);
            }
        });

        const moveSpeed = 360;
        const start = cc.v2(this.node.x, this.node.y);
        const delta = targetPos.sub(start);
        const duration = delta.mag() / moveSpeed;
        const move =  cc.moveTo(duration, targetPos)
        this._walk();

        return cc.sequence(move, end);
    },

    _updateAnimation () {
        if (this._motionState === MotionState.Stand)
            this._stand();
        else
            this._walk();
    },

    _stand () {
        const clip = this._standClips[this._direction];
        this._motionState = MotionState.Stand;
        if (clip.name !== this._animation.currentClip.name)
            this._animation.play(clip.name);
    },

    _walk () {
        const clip = this._walkClips[this._direction];
        this._motionState = MotionState.Walk;
        if (clip.name !== this._animation.currentClip.name)
            this._animation.play(clip.name);
    },

    _initAnimation () {
        this._standClips = [];
        this._standClips[Direction.East] = this._createClip('stand-east', 'cs', 4);
        this._standClips[Direction.South] = this._createClip('stand-south', 'zs', 4);
        this._standClips[Direction.West] = this._createClip('stand-west', 'cys', 4);
        this._standClips[Direction.North] = this._createClip('stand-north', 'bs', 4);
        
        this._walkClips = [];
        this._walkClips[Direction.East] = this._createClip('walk-east', 'cz', 8);
        this._walkClips[Direction.South] = this._createClip('walk-south', 'zz', 8);
        this._walkClips[Direction.West] = this._createClip('walk-west', 'cy', 8);
        this._walkClips[Direction.North] = this._createClip('walk-north', 'bz', 8);

        this._animation = this.sprite.addComponent(cc.Animation);
        this._standClips.forEach(clip => this._animation.addClip(clip));
        this._walkClips.forEach(clip => this._animation.addClip(clip));
        this._animation.play('stand-south');
        this._direction = Direction.South;
        this._motionState = MotionState.Stand;
    },

    _createClip (name, prefix, numFrames, start = 1, sample = 8) {
        const frames = [];
        const end = start + numFrames;
        for (let i = start; i < end; ++i) {
            const frameName = `${prefix}_${i}`;
            frames.push(this.atlas.getSpriteFrame(frameName));
        }

        const clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
        clip.name = name;
        clip.wrapMode = cc.WrapMode.Loop;

        return clip;
    },
});
