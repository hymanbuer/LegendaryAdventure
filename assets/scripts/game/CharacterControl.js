
const Direction = cc.Enum({
    East: 0,
    South: 1,
    West: 2,
    North: 3,
});

const MoveState = cc.Enum({
    Stop: 0,
    Moving: 1,
    TriggeringEvent: 2,
    BeforeEnter: 3,
    AfterEnter: 4,
    BeforeExit: 5,
    AfterExit: 6,
});

const MOVE_TAG = 100;
const MOVE_SPEED = 280;

function fuzzyEqual(a, b) {
    const variance = 4;
    if (a - variance <= b && b <= a + variance) {
        return true;
    }
    return false;
}

cc.Class({
    extends: cc.Component,

    statics: {
        Direction: Direction,
    },

    properties: {
        _moveSpeed: MOVE_SPEED,
        moveSpeed: {
            get () {
                return this._moveSpeed;
            },
            set (value) {
                if (typeof value == 'number' && value > 0) {
                    this._moveSpeed = value;
                }
            }
        }
    },

    onLoad () {
        this._path = [];
        this._moveState = MoveState.Stop;
        this._stateFuncs = [];
        this._stateFuncs[MoveState.Stop] = this._stateFuncStop;
        this._stateFuncs[MoveState.Moving] = this._stateFuncMoving;
        this._stateFuncs[MoveState.TriggeringEvent] = this._stateFuncTriggeringEvent;
        this._stateFuncs[MoveState.BeforeEnter] = this._stateFuncBeforeEnter;
        this._stateFuncs[MoveState.AfterEnter] = this._stateFuncAfterEnter;
        this._stateFuncs[MoveState.BeforeExit] = this._stateFuncBeforeExit;
        this._stateFuncs[MoveState.AfterExit] = this._stateFuncAfterExit;
    },

    update (dt) {
    },

    lateUpdate () {
        const stateFunc = this._stateFuncs[this._moveState];
        stateFunc.call(this);
    },

    headingTo (direction) {
        this.node.emit('character-rotate', direction);
    },

    getNextPosition () {
        return this._movingPos && cc.v2(this._movingPos) || cc.v2(this.node.position);
    },

    followPath (path) {
        this._path = path;
        this._paused = false;
    },

    pausePath () {
        this._paused = true;
    },

    resumePath () {
        this._paused = false;
    },

    ///////////////////////////////

    _changeState (state) {
        if (state !== this._moveState) {
            this._moveState = state;
            const stateFunc = this._stateFuncs[this._moveState];
            stateFunc.call(this);
        }
    },

    _stateFuncStop () {
        if (!this._paused && this._path.length > 0) {
            this._walk();
            this._changeState(MoveState.Moving);
        }
    },

    _stateFuncMoving () {
        if (this._isMoving()) {
            return;
        }

        this._movingPos = null;
        if (this._paused) {
            this._stand();
            this._changeState(MoveState.Stop);
            return;
        }

        if (this._nextPos != null) {
            this.node.runAction(this._getMoveToAction(this._nextPos));
            this._movingPos = this._nextPos;
            this._prevPos = cc.v2(this.node.position);
            this._nextPos = null;
        } else {
            if (this._prevPos != null) {
                this._changeState(MoveState.AfterExit);
            } else if (this._nextPos == null && this._path.length > 0) {
                this._nextPos = this._path.shift();
                this._changeState(MoveState.BeforeExit);
            } else {
                this._stand();
                this._changeState(MoveState.Stop);
            }
        }
    },

    _stateFuncTriggeringEvent () {
        
    },

    _stateFuncAfterExit () {
        const prevPos = this._prevPos;
        this._prevPos = null;
        this._triggerEvent('after-exit-position', MoveState.AfterEnter, prevPos);
    },

    _stateFuncAfterEnter () {
        const current = cc.v2(this.node.position);
        this._triggerEvent('after-enter-position', MoveState.Moving, current);
    },

    _stateFuncBeforeExit () {
        const current = cc.v2(this.node.position);
        this._triggerEvent('before-exit-position', MoveState.BeforeEnter, current);
    },

    _stateFuncBeforeEnter () {
        this._rotateTo(this._nextPos);
        this._triggerEvent('before-enter-position', MoveState.Moving, this._nextPos);
    },

    ///////////////////////////

    _getMoveToAction (target) {
        const start = cc.v2(this.node.x, this.node.y);
        const delta = target.sub(start);
        const duration = delta.mag() / this.moveSpeed;
        const move =  cc.moveTo(duration, target);
        move.setTag(MOVE_TAG);
        return move;
    },

    _isMoving () {
        return this.node.getActionByTag(MOVE_TAG) != null;
    },

    _triggerEvent (eventName, nextState, ...eventArgs) {
        let callOnce = false;
        const callback = isPass => {
            if (!callOnce && cc.isValid(this)) {
                callOnce = true;
                if (isPass) {
                    this._changeState(nextState);
                } else {
                    this._paused = true;
                    this._nextPos = null;
                    this._stand();
                    this._changeState(MoveState.Stop);
                }
            }
        };
        this._changeState(MoveState.TriggeringEvent);
        if (this.node.hasEventListener(eventName)) {
            this.node.emit(eventName, this, ...eventArgs, callback);
        } else {
            callback(true);
        }
    },

    _rotateTo (target) {
        let direction = null;
        const isXEqual = fuzzyEqual(target.x, this.node.x);
        const isYEqual = fuzzyEqual(target.y, this.node.y);
        if (!isXEqual && target.x > this.node.x) {
            direction = Direction.East;
        } else if (!isXEqual && target.x < this.node.x) {
            direction = Direction.West;
        } else if (!isYEqual && target.y < this.node.y) {
            direction = Direction.South;
        } else if (!isYEqual && target.y > this.node.y) {
            direction = Direction.North;
        }
        if (direction != null) {
            this.node.emit('character-rotate', direction);
        }
    },

    _stand () {
        this.node.emit('character-stand');
    },

    _walk () {
        this.node.emit('character-walk');
    },
});
