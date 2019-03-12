
const PanelManager = require('PanelManager');
const PanelTalk = require('PanelTalk');
const PanelGetItemDialog = require('PanelGetItemDialog');
const Game = require('Game');

function showTalk(title, talkList, type = PanelTalk.TalkType.Normal) {
    return new Promise(resolve => {
        return PanelManager.instance.openPanel('talk', title, talkList, type)
            .then(() => PanelManager.instance.onPanelClosed('talk', () => resolve(true)));
    });
}

class EventTalk {
    constructor (event) {
        this.title = event.NAME;
        this.talkList = event.TALK;
    }

    fire (trigger) {
        return showTalk(this.title, this.talkList);
    }
}

class EventTask {
    constructor (event) {
        this.event = event;
        this.title = event.NAME;
        this.state = Game.taskState.getTaskState(event.ID);
    }

    fire (trigger) {
        if (this.state === 0) {
            this.state = 1;
            Game.taskState.setTaskState(this.event.ID, 1);
            return showTalk(this.title, this.event.TASK, PanelTalk.TalkType.Task);
        } else if (this.state === 1) {
            if (Game.bag.getNumOfItem(this.event.TASKNEEDED) > 0) {
                this.state = 2;
                Game.taskState.setTaskState(this.event.ID, 2);

                trigger.node.destroy();
                Game.mapState.removeEntity(trigger.floorId, trigger.grid);

                return showTalk(this.title, this.event.TASKEND);
            } else {
                return showTalk(this.title, this.event.TASKING);
            }
        }
    }
}

class EventAward {
    constructor (event) {
        this.awardGid = Number.parseInt(event.TASKAWARD);
        this.message = event.MESSAGE;
    }

    fire (trigger) {
        return new Promise(resolve => {
            trigger.node.destroy();
            Game.bag.addItem(this.awardGid);

            return PanelManager.instance.openPanel('get_item_dialog', this.awardGid, this.message)
                .then(() => PanelManager.instance.onPanelClosed('get_item_dialog', () => resolve(true)));
        });
    }
}

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {

    },

    init (event) {
        this._eventList = [];
        if (event.TALK) {
            this._eventList.push(new EventTalk(event));
        } else if (event.TASK) {
            this._eventList.push(new EventTask(event));
        }

        if (event.TASKAWARD) {
            this._eventList.push(new EventAward(event));
        }
    },

    doBeforeEnter () {
        return new Promise(resolve => {
            const fireNext = next => {
                if (next >= this._eventList.length) {
                    return resolve(false);
                }
    
                const event = this._eventList[next];
                event.fire(this).then((isNext)=> {
                    if (!cc.isValid(this) || !cc.isValid(this.node))
                        return resolve(false);

                    this._checkAfterTalk(event);
                    isNext ? fireNext(next + 1) : resolve(false);
                });
            };
            fireNext(0);
        });
    },

    doAfterEnter () {
        return Promise.resolve(true);
    },

    _checkAfterTalk (event) {
        if (event instanceof EventTalk && this.gid === 405) {
            const event = new cc.Event.EventCustom('addentity', true);
            event.detail = {
                gid: 406,
                x: this.grid.x,
                y: this.grid.y,
            };
            this.node.dispatchEvent(event);

            Game.mapState.setEntityState(this.floorId, this.grid, 406);
        }
    },
});
