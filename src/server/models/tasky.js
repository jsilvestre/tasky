import cozydb from 'cozydb';
import invariant from 'invariant';
import logger from 'debug';
import hasValue from '../hasValue';

const debug = logger('app:model:tasky');

const Task = cozydb.getModel('Tasky', {
    'done': {
        default: false,
        type: Boolean,
    },
    'creationDate': {
        type: Date,
    },
    'completionDate': {
        default: null,
        type: Date,
    },
    'description': {
        default: '',
        type: String,
    },
    'order': {
        type: Number,
    },
    'tags': {
        default: [],
        type: [String],
    },
    'isArchived': {
        default: false,
        type: Boolean,
    },
});

module.exports = Task;

Task.all = (callback) => {
    invariant(hasValue(callback), '`callback` is a mandatory parameter');
    invariant(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all tasks.');
    Task.request('all', {}, (err, tasks) => {
        const error = err || tasks.error;
        callback(error, tasks);
    });
};

Task.allInInterval = (options, callback) => {
    invariant(hasValue(options), '`options` is a mandatory parameter');
    invariant(typeof options === 'object', '`callback` must be an object');
    invariant(hasValue(callback), '`callback` is a mandatory parameter');
    invariant(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all tasks in given interval.');
    Task.request('byOrder', options, (err, tasks) => {
        const error = err || tasks.error;
        callback(error, tasks);
    });
};

Task.allNotArchived = (callback) => {
    invariant(hasValue(callback), '`callback` is a mandatory parameter');
    invariant(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all unarchived tasks.');

    // null for backward compatibility
    const params = {
        keys: [false, null],
    };
    Task.request('byArchiveState', params, (err, tasks) => {
        const error = err || tasks.error;
        callback(error, tasks);
    });
};

Task.allArchived = (callback) => {
    invariant(hasValue(callback), '`callback` is a mandatory parameter');
    invariant(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all archived tasks.');
    const params = {
        key: true,
    };
    Task.request('byArchiveState', params, (err, tasks) => {
        const error = err || tasks.error;
        callback(error, tasks);
    });
};
