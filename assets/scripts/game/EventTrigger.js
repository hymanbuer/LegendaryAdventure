
const UiManager = require('UiManager');
const UiTalk = require('UiTalk');
const Bag = require('Bag');
const TaskState = require('TaskState');
const MapState = require('MapState');
const UiGetItemDialog = require('UiGetItemDialog');

function showTalk(title, talkList, type = UiTalk.TalkType.Normal) {
    return new Promise((resolve, reject) => {
        UiManager.instance.showUi('prefabs/ui_talk').then(ui => {
            const uiTalk = ui.getComponent(UiTalk);
            uiTalk.talkTitle = title;
            uiTalk.talkList = talkList;
            uiTalk.talkType = type;
            ui.ondestroy = ()=> resolve(true);
        }, reject);
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
        this.state = TaskState.instance.getTaskState(event.ID);
    }

    fire (trigger) {
        if (this.state === 0) {
            this.state = 1;
            TaskState.instance.setTaskState(this.event.ID, 1);
            return showTalk(this.title, this.event.TASK, UiTalk.TalkType.Task);
        } else if (this.state === 1) {
            if (Bag.instance.getNumOfItem(this.event.TASKNEEDED) > 0) {
                this.state = 2;
                TaskState.instance.setTaskState(this.event.ID, 2);

                trigger.node.destroy();
                MapState.instance.removeEntity(trigger.floorId, trigger.grid);

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
        return new Promise((resolve, reject) => {
            trigger.node.destroy();
            Bag.instance.addItem(this.awardGid);

            UiManager.instance.showUi('prefabs/ui_get_item_dialog').then(ui => {
                const dialog = ui.getComponent(UiGetItemDialog);
                dialog.setItem(this.awardGid, this.message);
                ui.ondestroy = ()=> resolve(false);
            }, reject);
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

            MapState.instance.setEntityState(this.floorId, this.grid, 406);
        }
    },
});
