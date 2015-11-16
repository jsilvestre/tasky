import async from 'async';
import logger from 'debug';
import FavoriteTag from '../models/favorite_tag';
import hasValue from '../hasValue';

const debug = logger('app:controller:tags');

export function create(req, res, next) {
    const {label} = req.body;

    debug('Set a tag as favorite.');
    FavoriteTag.byLabelForTasky(label, (err, tags) => {
        if (hasValue(err) || (hasValue(tags) && tags.length > 0)) {
            const error = err || 'tag is already favorite';
            next(error);
        } else {
            debug(`Persist the tag "${label}" as favorite.`);
            const payload = {label, application: 'tasky'};
            FavoriteTag.create(payload, (error) => {
                if (hasValue(error)) {
                    next(error);
                } else {
                    res.status(201).json(payload);
                }
            });
        }
    });
}

export function remove(req, res, next) {
    const {label} = req.body;

    debug('Unset a tag as favorite.');
    FavoriteTag.byLabelForTasky(label, (err, tags) => {
        if (hasValue(err) || (hasValue(tags) && tags.length === 0)) {
            const error = new Error(err || 'tag is not favorite');
            next(error);
        } else {
            debug('Remove the document.');
            async.eachSeries(tags, (tag, done) => {
                tag.destroy(done);
            }, (err2) => {
                if (hasValue(err2)) {
                    const error = new Error(err2);
                    next(error);
                } else {
                    res.status(204).send();
                }
            });
        }
    });
}
