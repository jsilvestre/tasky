"use strict";

import {Dispatcher} from "flux";
import {PayloadSources} from "./constants/AppConstants";

// Custom dispatcher class to add semantic method.
class AppDispatcher extends Dispatcher {

    handleViewAction(action) {
        const payload = {
            source: PayloadSources.VIEW_ACTION,
            action: action
        };

        this.dispatch(payload);
    }

    handleServerAction(action) {
        const payload = {
            source: PayloadSources.SERVER_ACTION,
            action: action
        };

        this.dispatch(payload);
    }
}

export const singleton = new AppDispatcher();
