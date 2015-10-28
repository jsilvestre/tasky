import async from 'async';
import invariant from 'invariant';
import logger from 'debug';
import Task from '../models/tasky';
import hasValue from '../hasValue';

const debug = logger('app:lib:reindexer');

// Act like a singleton. Not reindexing by default.
let flagReindexing = false;

export function isReindexing() {
    return flagReindexing;
}

export function processIndexation(callback) {
    invariant(hasValue(callback), '`callback` is a mandatory parameter');
    invariant(typeof callback === 'function', '`callback` must be a function');

    debug('Start reindexation process.');

    debug('Mark the server as being reindexing.');
    flagReindexing = true;

    debug('Retrieve all tasks.');
    Task.allInInterval({}, (err, tasks) => {
        if (hasValue(err)) {
            callback(err);
        } else {
            debug('Compute constants to perform the reindexation.');
            const minOrder = 0;
            const maxOrder = Number.MAX_VALUE;
            const numTasks = tasks.length;
            const step = (maxOrder - minOrder) / (numTasks + 1);

            async.mapSeries(tasks, (task, next) => {
                const id = task.id;
                const order = minOrder + (tasks.indexOf(task) + 1) * step;
                task.updateAttributes({order}, (err2) => {
                    if (hasValue(err2)) {
                        debug(err2);
                    }
                    next(null, {id, order});
                });
            }, (err2, updatedTasks) => {
                if (hasValue(err2)) {
                    const msg = `Something went wrong while reindexing tasks
                                 -- ${err2}`;
                    debug(msg);
                } else {
                    debug('Tasks have been successfully reindexed');
                }

                debug('Reset the server\'s state.');
                flagReindexing = false;
                callback(err, updatedTasks);
            });
        }
    });
}
