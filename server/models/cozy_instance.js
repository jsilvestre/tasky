"use strict";

import * as americano from "americano";

import * as hasValue from "../hasValue";

export const CozyInstance = americano.getModel("CozyInstance", {
    id: { type: String },
    domain: { type: String },
    locale: {type: String }
});

CozyInstance.first = function(callback) {
    CozyInstance.request("all", (err, instances) => {
        if(hasValue(err)) {
            callback(err);
        }
        else if(!hasValue(instances) || instances.length === 0) {
            callback(null, null);
        }
        else {
            callback(null, instances[0]);
        }
    });
};

CozyInstance.getLocale = function(callback) {
    CozyInstance.first((err, instance) => {
        if(hasValue(err)) {
            callback(err);
        }
        else if (hasValue(instance)){
            callback(null, instance.locale);
        }
        else {
            callback(null, "en");
        }
    });
};
