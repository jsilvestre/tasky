import {ActionTypes} from '../constants/AppConstants';
import * as XHRUtils from '../utils/XHRUtils';

export const SELECT_TAGS = 'SELECT_TAGS';
export function selectTags(tags) {
    return {
        type: ActionTypes.SELECT_TAGS,
        value: tags,
    };
}

export const SELECT_SORT_CRITERION = 'SELECT_SORT_CRITERION';
export function selectSortCriterion(criterion) {
    localStorage.setItem('sort-criterion', criterion);

    return {
        type: ActionTypes.SELECT_SORT_CRITERION,
        value: criterion,
    };
}

export const TOGGLE_FAVORITE_TAG = 'TOGGLE_FAVORITE_TAG';
export function toggleFavorite(label) {
    return (dispatch, getState) => {
        const favoriteTags = getState().favoriteTags;

        // fav the tag
        if (favoriteTags.indexOf(label) === -1) {
            dispatch({
                type: ActionTypes.TOGGLE_FAVORITE_TAG,
                value: label,
            });

            XHRUtils.markTagAsFavorite(label, () => {});
        } else { // unfav the tag
            dispatch({
                type: ActionTypes.TOGGLE_FAVORITE_TAG,
                value: label,
            });

            XHRUtils.unmarkTagAsFavorite(label, () => {});
        }
    };
}

export const MARK_SEARCH_AS_FAVORITE = 'MARK_SEARCH_AS_FAVORITE';
export function markCurrentSearchAsFavorite() {
    return (dispatch, getState) => {
        const {selectedTags, favoriteSearch} = getState();

        let markAsFavorite;
        const serializedSelectedTags = JSON.stringify(selectedTags);
        const serializedFavoriteSearch = JSON.stringify(favoriteSearch);
        if (serializedSelectedTags === serializedFavoriteSearch) {
            markAsFavorite = null;
        } else {
            markAsFavorite = selectedTags;
        }

        dispatch({
            type: ActionTypes.MARK_SEARCH_AS_FAVORITE,
            value: markAsFavorite,
        });

        XHRUtils.markSearchAsFavorite(markAsFavorite);
    };
}
