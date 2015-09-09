"use strict";

import * as Task from "../models/tasky";
import * as reindexer from "../lib/reindexer";
import * as hasValue from "../hasValue";

function reindexationMiddleware(req, res, next) {
    if(reindexer.isReindexing()) {
        res.status(400).send({error: "reindexation is occuring, retry later"});
        // next(err);
    }
    else {
        next();
    }
}

function create(req, res, next) {
    Task.create(req.body, (err, task) => {
        if(hasValue(err)) {
            res.status(500).json({
                error: `An error occured while creating a task -- ${err}`
            });
        }
        else {
            res.status(201).json(task);
        }
    });
}

function fetch(req, res, next, id) {
    Task.find(id, (err, task) => {
        if(hasValue(err) || !hasValue(task)) {
            res.status(404).json({error: "Task not found"});
            // next(error);
        }
        else {
            req.task = task;
            next();
        }
    });
}

function update(req, res, next) {
    req.task.updateAttributes(req.body, (err, task) => {
        if(hasValue(err)) {
            res.status(500).json({
                error: `An error occured while updating a task -- ${err}`
            });
            // next(err);
        }
        else {
            res.status(200).json(task);
        }
    });
}

function remove(req, res) {
    req.task.destroy((err) => {
        if(hasValue(err)) {
            res.status(500).json({
                error: `An error occured while deleting a task -- ${err}`
            });
            // next(err);
        }
        else {
            res.send(204);
        }
    });
}

function reindex(req, res) {
    reindexer.reindex((err, tasks) => {
        if(hasValue(err)) {
            res.status(500).json({error: err});
        }
        else {
            res.status(200).json(tasks);
        }
    });
}

export {reindexationMiddleware, create, fetch, update, remove, reindex};
