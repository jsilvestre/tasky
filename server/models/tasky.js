"use strict";

import * as americano from "americano";

export const Task = americano.getModel("Tasky", {
    "done": {
        default: false,
        type: Boolean
    },
    "creationDate": {
        default: Date.now,
        type: Date
    },
    "completionDate": {
        default: null,
        type: Date
    },
    "description": String,
    "order": Number,
    "tags": { type: JSON },
    "isArchived": {
        default: false,
        type: Boolean
    }
});

Task.all = function(callback) {
    Task.request("all", {}, (err, tasks) => {
        err = err || tasks.error;
        callback(err, tasks);
    });
};

Task.allInInterval = function(options, callback) {
    Task.request("byOrder", options, (err, tasks) => {
        err = err || tasks.error;
        callback(err, tasks);
    });
};

Task.allNotArchived = function(callback) {
    // null for backward compatibility
    const params = {
        keys: [false, null]
    };
    Task.request("byArchiveState", params, (err, tasks) => {
        err = err || tasks.error;
        callback(err, tasks);
    });
};

Task.allArchived = function(callback) {
    const params = {
        key: true
    };
    Task.request("byArchiveState", params, (err, tasks) => {
        err = err || tasks.error;
        callback(err, tasks);
    });
};
