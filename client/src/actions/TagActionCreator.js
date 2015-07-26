"use strict";

import * as AppDispatcher from "../AppDispatcher";
import * as TagStore from "../stores/TagStore";
import {ActionTypes} from "../constants/AppConstants";
import * as XHRUtils from "../utils/XHRUtils";

export function selectTags(tags) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.SELECT_TAGS,
        value: tags
    });
}

export function selectSortCriterion(criterion) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.SELECT_SORT_CRITERION,
        value: criterion
    });

    localStorage.setItem("sort-criterion", criterion);
}

export function toggleFavorite(label) {

    const favoriteTags = TagStore.getFavoriteTags();
    // fav the tag
    if(favoriteTags.indexOf(label) === -1) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.TOGGLE_FAVORITE_TAG,
            value: label
        });

        XHRUtils.markTagAsFavorite(label, function() {});
    }
    // unfav the tag
    else {
        AppDispatcher.handleViewAction({
            type: ActionTypes.TOGGLE_FAVORITE_TAG,
            value: label
        });

        XHRUtils.unmarkTagAsFavorite(label, function() {});
    }
}

export function markCurrentSearchAsFavorite() {
    const selectedTags = TagStore.getSelected();
    const currentFavoriteSearch = TagStore.getFavoriteSearch();
    let markAsFavorite;
    if(JSON.stringify(selectedTags) === JSON.stringify(currentFavoriteSearch)) {
        markAsFavorite = null;
    }
    else {
        markAsFavorite = selectedTags;
    }

    AppDispatcher.handleViewAction({
        type: ActionTypes.MARK_SEARCH_AS_FAVORITE,
        value: markAsFavorite
    });

    XHRUtils.markSearchAsFavorite(markAsFavorite);
}
