
const Direction = cc.Enum({
    East: 0,
    South: 1,
    West: 2,
    North: 3,
});

cc.Class({
    extends: cc.Component,

    statics: {
        Direction: Direction,
    },

    properties: {
        
    },

    onLoad () {
        this._path = [];
    },

    update (dt) {
        if (this._nextPos) {
            const displacement = this._velocity.mul(dt);
            this.node.position.addSelf(displacement);
            if (this._nextPos.fuzzyEquals(this.node.position, 1.0)) {
                this._nextPos = null;
            }
        }
        if (this._nextPos == null && this._path.length > 0) {
            this._nextPos = this._path.shift();
        }
    },

    getNextPosition () {
        return this._nextPos && cc.v2(this._nextPos) || cc.v2(this.node.position);
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
        const direction = isUp ? Direction.North : Direction.South;
        this.node.emit('character-rotate', direction);
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
        let direction = Direction.East;
        if (target.x > this.grid.x) direction = Direction.East;
        else if (target.x < this.grid.x) direction = Direction.West;
        else if (target.y > this.grid.y) direction = Direction.South;
        else if (target.y < this.grid.y) direction = Direction.North;

        this.node.emit('character-rotate', direction);
    
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

    _stand () {
        this.node.emit('character-stand');
    },

    _walk () {
        this.node.emit('character-walk');
    },
});
