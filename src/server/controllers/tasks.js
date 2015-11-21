import hasValue from '../hasValue';
import {isReindexing, processIndexation} from '../lib/reindexer';
import Task from '../models/tasky';

export function reindexationMiddleware(req, res, next) {
    if (isReindexing()) {
        const error = new Error('reindexation is occuring, retry later');
        error.status = 400;
        next(error);
    } else {
        next();
    }
}

export function create(req, res, next) {
    Task.create(req.body, (err, task) => {
        if (hasValue(err)) {
            const message = `An error occured while creating a task -- ${err}`;
            const error = new Error(message);
            next(error);
        } else {
            res.status(201).json(task);
        }
    });
}

export function fetch(req, res, next, id) {
    Task.find(id, (err, task) => {
        if (hasValue(err) || !hasValue(task)) {
            const error = new Error('Task not found');
            error.status = 404;
            next(error);
        } else {
            req.task = task;
            next();
        }
    });
}

export function update(req, res, next) {
    req.task.updateAttributes(req.body, (err, task) => {
        if (hasValue(err)) {
            const message = `An error occured while updating a task -- ${err}`;
            const error = new Error(message);
            next(error);
        } else {
            res.status(200).json(task);
        }
    });
}

export function remove(req, res, next) {
    req.task.destroy((err) => {
        if (hasValue(err)) {
            const message = `An error occured while deleting a task -- ${err}`;
            const error = new Error(message);
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
}

export function reindex(req, res, next) {
    processIndexation((err, tasks) => {
        if (hasValue(err)) {
            const error = new Error(err);
            next(error);
        } else {
            res.status(200).json(tasks);
        }
    });
}
