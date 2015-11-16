import React from 'react/addons';

import BreadcrumbItem from './breadcrumb-item';
import AdjustableInput from './adjustable-input';
import hasValue from '../utils/hasValue';


export default React.createClass({
    displayName: 'Breadcrumb',

    propTypes: {
        isArchivedModeEnabled: React.PropTypes.bool.isRequired,
        onOpenMenu: React.PropTypes.func.isRequired,
        searchQuery: React.PropTypes.string,
        selectedTags: React.PropTypes.array,
    },

    getInitialState() {
        return {inputContent: ''};
    },

    onSubmit(newTagValue) {
        let searchQuery = this.props.searchQuery;
        let newTagsList = null;

        if (hasValue(this.props.selectedTags)) {
            newTagsList = this.props.selectedTags.slice(0);
        }

        // Tag or search query?
        if (newTagValue.indexOf('#') === 0 || newTagValue.indexOf('!#') === 0) {
            const isExcluded = newTagValue.indexOf('!') === 0;

            // Removes tag and exclusion markers.
            const sanitizedTagValue = newTagValue.replace(/[!#]*/, '');

            if (hasValue(newTagsList)) {
                newTagsList.push({
                    label: sanitizedTagValue,
                    isExcluded,
                });
            } else {
                newTagsList = [{
                    label: sanitizedTagValue,
                    isExcluded,
                }];
            }
        } else {
            searchQuery = newTagValue;
        }

        this.buildUrl(newTagsList, searchQuery);
    },

    getTitle() {
        let title = '';

        if (!hasValue(this.props.selectedTags)) {
            if (this.props.isArchivedModeEnabled) {
                title = t('all archived tasks');
            } else {
                title = t('all tasks');
            }
        } else if (this.hasNoTagSelected()) {
            title = t('untagged tasks');
        } else {
            const option = {smart_count: this.props.selectedTags.length}; // eslint-disable-line camelcase, max-len
            if (this.props.isArchivedModeEnabled) {
                title = t('archived tasks of', option);
            } else {
                title = t('tasks of', option);
            }
        }

        return title;
    },

    hasNoTagSelected() {
        return !hasValue(this.props.selectedTags) ||
               (hasValue(this.props.selectedTags) &&
                this.props.selectedTags.length === 0);
    },

    buildUrl(tagsList, searchQuery) {
        let formattedList = null;

        if (hasValue(tagsList)) {
            formattedList = tagsList
                .map(tag => {
                    return tag.isExcluded ? `!${tag.label}` : `${tag.label}`;
                })
                .join('/');
        } else {
            formattedList = '';
        }

        let query = '';
        let prefix = '';
        // If tags are selected.
        if (hasValue(tagsList) && tagsList.length > 0) {
            if (this.props.isArchivedModeEnabled) {
                prefix = 'archivedByTags';
            } else {
                prefix = 'todoByTags/';
            }

            if (hasValue(searchQuery)) {
                query = `/;search/${searchQuery}`;
            }
        } else if (hasValue(searchQuery)) {
            // If there is just a search query.
            prefix = 'search/';
            query = searchQuery;
        } else {
            // Nothing selected.
            if (this.props.isArchivedModeEnabled) {
                prefix = 'archived';
            } else {
                prefix = '';
            }
        }

        const location = `/${prefix}${formattedList}${query}`;
        window.location = window.router.createHref(location);
    },

    removeHandler(tag) {
        let newTagsList = null;
        let searchQuery = null;

        if (hasValue(this.props.selectedTags)) {
            newTagsList = this.props.selectedTags.slice(0);
        }

        if (hasValue(tag) && hasValue(newTagsList)) {
            const index = newTagsList.indexOf(tag);
            newTagsList.splice(index, 1);
        } else {
            searchQuery = null;
        }

        this.buildUrl(newTagsList, searchQuery);
    },

    toggleModeHandler(tag) {
        let newTagsList = null;

        if (hasValue(this.props.selectedTags)) {
            newTagsList = this.props.selectedTags.slice(0);
        }

        if (hasValue(newTagsList)) {
            const index = this.props.selectedTags.indexOf(tag);
            newTagsList[index] = {
                label: tag.label,
                isExcluded: !tag.isExcluded,
            };
        }

        this.buildUrl(newTagsList, this.props.searchQuery);
    },

    renderSearchInput() {
        let translationKey = 'match criterion';

        if (this.hasNoTagSelected()) {
            translationKey = `${translationKey} no tag`;
        } else {
            translationKey = `${translationKey} with tag`;
        }

        return (
            <BreadcrumbItem
                key="search-query"
                label={this.props.searchQuery}
                removeHandler={this.removeHandler}
                type="search" />
        );
    },

    renderSelectedTags() {
        return this.props.selectedTags.map((tag, index) => {
            return (
                <BreadcrumbItem key={index}
                    removeHandler={this.removeHandler.bind(this, tag)}
                    tag={tag}
                    toggleModeHandler={this.toggleModeHandler.bind(this, tag)}
                    type="tag"
                />
            );
        });
    },

    render() {
        const title = this.getTitle();

        let selectedTagsBlock = null;
        if (hasValue(this.props.selectedTags)) {
            selectedTagsBlock = this.renderSelectedTags();
        }

        let searchQueryBlock = null;
        if (hasValue(this.props.searchQuery)) {
            searchQueryBlock = this.renderSearchInput();
        }

        let inputBlock = null;
        const shouldRenderInput = !hasValue(this.props.selectedTags) ||
            (hasValue(this.props.selectedTags) && !this.hasNoTagSelected());
        if (shouldRenderInput) {
            inputBlock = (
                <AdjustableInput
                    className="add-tag"
                    id="add-tag-form"
                    onSubmitHandler={this.onSubmit}
                    placeholder={t('search tag input')} />
            );
        }

        return (
            <h1 id="breadcrumb">
                <i className="fa fa-bars" onClick={this.props.onOpenMenu} />
                <span>{title}</span>
                {selectedTagsBlock}
                {searchQueryBlock}
                {inputBlock}
            </h1>
        );
    },
});
