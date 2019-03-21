
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
const EMPTY_FUNC = function () {};

cc.Class({
    extends: cc.Component,

    statics: {
        Direction: Direction,
    },

    properties: {

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

    _changeState (state) {
        if (state !== this._moveState) {
            this._moveState = state;
            const stateFunc = this._stateFuncs[this._moveState];
            stateFunc.call(this);
        }
    },

    _stateFuncStop () {
        if (this._path.length > 0) {
            this._changeState(MoveState.Moving);
        }
    },

    _stateFuncMoving () {
        if (this.node.getActionByTag(MOVE_TAG) == null) {
            this._movingPos = null;
            if (this._nextPos != null) {
                const action = this._moveTo(this._nextPos);
                action.setTag(MOVE_TAG);
                this.node.runAction(action);
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
        }
    },

    _stateFuncTriggeringEvent () {
        // do nothing
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

    _stopPath () {
        this._prevPos = null;
        this._nextPos = null;
        this._path = [];
        this._stand();
        this._changeState(MoveState.Stop);
    },

    _triggerEvent (eventName, nextState, ...eventArgs) {
        let callOnce = false;
        const callback = isPass => {
            if (!callOnce && cc.isValid(this)) {
                callOnce = true;
                if (isPass) {
                    this._changeState(nextState);
                } else {
                    this._stopPath();
                }
            }
        };
        this._changeState(MoveState.TriggeringEvent);
        if (this.node.hasEventListener(eventName)) {
            this.node.emit(eventName, ...eventArgs, callback);
        } else {
            callback(true);
        }
    },

    getNextPosition () {
        return this._movingPos && cc.v2(this._movingPos) || cc.v2(this.node.position);
    },

    followPath (path) {
        this._path = path;
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

    _rotateTo (target) {
        let direction = null;
        if (target.x > this.node.x) direction = Direction.East;
        else if (target.x < this.node.x) direction = Direction.West;
        else if (target.y < this.node.y) direction = Direction.South;
        else if (target.y > this.node.y) direction = Direction.North;

        if (direction != null) {
            this.node.emit('character-rotate', direction);
        }
    },

    _moveTo (target) {
        const moveSpeed = 360;
        const start = cc.v2(this.node.x, this.node.y);
        const delta = target.sub(start);
        const duration = delta.mag() / moveSpeed;
        const move =  cc.moveTo(duration, target)
        this._walk();
        return move;
    },

    _stand () {
        this.node.emit('character-stand');
    },

    _walk () {
        this.node.emit('character-walk');
    },
});
