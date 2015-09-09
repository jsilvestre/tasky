"use strict";

import * as async from "async";
import * as FavoriteTag from "../models/favorite_tag";
import * as hasValue from "../hasValue";

function create(req, res, next) {

    const label = req.body.label;

    FavoriteTag.ByLabelForTasky(label, (err, tags) => {
        if(hasValue(err) || (hasValue(tags) && tags.length > 0)) {
            err = err || "tag is already favorite";
            res.status(500).json(err);
            // next(err);
        }
        else {
            FavoriteTag.create({label, application: "tasky"}, () => {
                res.send(201);
            });
        }
    });
}

function remove(req, res, next) {

    const label = req.body.label;

    FavoriteTag.ByLabelForTasky(label, (err, tags) => {
        if(hasValue(err) || (hasValue(tags) && tags.length > 0)) {
            err = err || "tag is not favorite";
            res.status(500).json(err);
            // next(err);
        }
        else {
            async.eachSeries(tags, (tag, done) => {
                tag.destroy(done);
            }, () => {
                res.send(204);
            });
        }
    });
}

export {create, remove};
