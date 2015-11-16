import hasValue from '../utils/hasValue';
import { selectTags } from './tags';
import _ from 'underscore';

function byTags(rawTags, searchQuery, isArchivedModeEnabled) {
    let tags;
    if (hasValue(rawTags)) {
        tags = rawTags.split('/');

        // If the last char is '/', there is an empty element that must be
        // removed.
        if (tags[tags.length - 1].length === 0) {
            tags.splice(tags.length - 1);
        }
    }

    return {
        isArchivedModeEnabled,
        searchQuery,
        selectedTags: selectTags(tags),
    };
}

export default function routeReducer(state = {}, action) {
    switch (action.name) {

        case 'main':
            return _.extend({}, state, byTags(null, null, false));

        case 'archived':
            return _.extend({}, state, byTags(null, null, true));

        case 'byTags':
            return _.extend({}, state, byTags(action.params[0], null, false));

        case 'archivedByTags':
            return _.extend({}, state, byTags(action.params[0], null, true));

        case 'search':
            return _.extend({}, state,
                byTags(null, action.params.query, false)
            );

        case 'byTagsSearch':
            return _.extend({}, state,
                byTags(action.params.tags, action.params.query, false)
            );

        default:
            return state;
    }
}
