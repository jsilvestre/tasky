"use strict";

import {EventEmitter} from "events";
import * as hasValue from "../../../utils/hasValue";
import * as AppDispatcher from "../../../AppDispatcher";

const baseObject = function Store() {

    this.uniqID = null;

    /* this variable will be shared with all subclasses so we store the items by
       subclass we don't use `@constructor.name` because it breaks when mangled.
    */
    let _nextUniqID = 0;
    let _handlers = {};
    const _addHandlers = function(type, callback) {
        if (!hasValue(_handlers[this.uniqID])) {
            _handlers[this.uniqID] = {};
        }
        _handlers[this.uniqID][type] = callback;
    };

    // Register the store's callbacks to the dispatcher.
    const _processBinding = function() { // eslint-disable-line
        this.dispatchToken = AppDispatcher.register( payload => {
            const type = payload.action.type;
            const value = payload.action.value;
            if(hasValue(_handlers[this.uniqID]) && hasValue(_handlers[this.uniqID][type])) { // eslint-disable-line
                const callback = _handlers[this.uniqID][type];
                callback.call(this, value);
            }
        });
    };
};

baseObject.prototype = EventEmitter;

class Pouet extends EventEmitter {
    constructor() {
        this.uniqID = null;
    }
}
