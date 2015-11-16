import hasValue from '../utils/hasValue';
import _ from 'underscore';
import {
    SELECT_TAGS, TOGGLE_FAVORITE_TAG,
    MARK_SEARCH_AS_FAVORITE, SELECT_SORT_CRITERION
} from '../actions/TagActionCreator';


export function selectTags(tags) {
    let selectedTags;

    if (hasValue(tags)) {
        selectedTags = tags.map(tag => {
            const isExcluded = tag.indexOf('!') !== -1;
            const label = tag.replace('!', '');
            return {label, isExcluded};
        });
    } else {
        selectedTags = null;
    }

    return selectedTags;
}

function toggleFavoriteTag(favoriteTags, tag) {
    const tagIndex = favoriteTags.indexOf(tag);

    const results = [].concat(favoriteTags);
    if (tagIndex === -1) {
        results.push(tag);
    } else {
        results.splice(tagIndex, 1);
    }

    return results;
}


export default function tagReducer(state = {}, action) {
    switch (action.type) {
        case SELECT_TAGS:
            return _.extend({}, state, {
                selectedTags: selectTags(action.value),
            });

        case TOGGLE_FAVORITE_TAG:
            return _.extend({}, state, {
                favoriteTags: toggleFavoriteTag(state.favoriteTags,
                                                action.value),
            });

        case SELECT_SORT_CRITERION:
            return _.extend({}, state, {sortCriterion: action.value});

        case MARK_SEARCH_AS_FAVORITE:
            return _.extend({}, state, {favoriteSearch: action.value});

        default:
            return state;
    }
}
