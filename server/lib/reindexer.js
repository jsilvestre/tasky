"use strict";

import * as async from "async";
import * as Task from "../models/tasky";
import * as hasValue from "../hasValue";

// Act like a singleton. Not reindexing by default.
let isReindexing = false;

function isReindexing() {
    return isReindexing;
}

function reindex(callback) {

    // First mark the server as being reindexing.
    isReindexing = true;

    Task.allInInterval({}, (err, tasks) => {

        if(hasValue(err)) {
            console.log(err);
        }

        const minOrder = 0;
        const maxOrder = Number.MAX_VALUE;
        const numTasks = tasks.length;
        const step = (maxOrder - minOrder) / (numTasks + 1);

        async.mapSeries(tasks, (task, next) => {
            const id = task.id;
            const order = minOrder + (tasks.indexOf(task) + 1) * step;
            task.updateAttributes({order}, (err2) => {
                // do something with err2.
                next(null, {id, order});
            });
        }, (err2, updatedTasks) => {
            if(hasValue(err2)) {
                const msg = `Something went wrong while reindexing tasks
                             -- ${err2}`;
                console.log(msg);
            }
            else {
                console.log("Tasks have been successfully reindexed");
            }

            // Reset the server's state.
            isReindexing = false;
            callback(err, updatedTasks);
        });
    });
}

export {isReindexing, reindex};
