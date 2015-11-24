import cozydb from 'cozydb';
import invariant from 'invariant';
import logger from 'debug';
import hasValue from '../hasValue';

const debug = logger('app:model:favorite_tag');

const FavoriteTag = cozydb.getModel('FavoriteTag', {
    'label': String,
    'application': String,
});

module.exports = FavoriteTag;

FavoriteTag.allForTasky = (callback) => {
    invariant(hasValue(callback), '`callback` is a mandatory parameter');
    invariant(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve all favorite tag for app Tasky.');
    FavoriteTag.request('allByApp', {key: 'tasky'}, (err, tags) => {
        const error = err || tags.error;
        if (hasValue(error)) {
            callback(error);
        } else {
            const labels = tags.map(tag => tag.label);
            callback(null, labels);
        }
    });
};

FavoriteTag.byLabelForTasky = (label, callback) => {
    invariant(hasValue(label), '`label` is a mandatory parameter');
    invariant(hasValue(callback), '`callback` is a mandatory parameter');
    invariant(typeof label === 'string', '`label` must be a string');
    invariant(typeof callback === 'function', '`callback` must be a function');

    debug('Retrieve a favorite tag given a label, for app Tasky.');
    const options = {
        key: ['tasky', label],
    };
    FavoriteTag.request('byAppByLabel', options, callback);
};
