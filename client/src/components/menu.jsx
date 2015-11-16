import styler from 'classnames';
import React from 'react/addons';
import _ from 'underscore';
import * as TagActionCreator from '../actions/TagActionCreator';

import hasValue from '../utils/hasValue';

import {SortCriterions} from '../constants/AppConstants';

import MenuItem from './menu-item';

const SortCriterionsValue = Object.keys(SortCriterions)
                            .map(criterion => SortCriterions[criterion]);

export default React.createClass({
    displayName: 'Menu',

    propTypes: {
        dispatch: React.PropTypes.func.isRequired,
        isArchivedModeEnabled: React.PropTypes.bool.isRequired,
        numArchivedTasks: React.PropTypes.number.isRequired,
        numTasks: React.PropTypes.number.isRequired,
        onOpenMenu: React.PropTypes.func.isRequired,
        selectedTags: React.PropTypes.array,
        sortCriterion: React.PropTypes.oneOf(SortCriterionsValue).isRequired,
        tree: React.PropTypes.array.isRequired,
        untaggedTasks: React.PropTypes.array.isRequired,
    },

    onSelectCriterion(criterion, event) {
        event.preventDefault();
        this.props.dispatch(TagActionCreator.selectSortCriterion(criterion));
    },

    onFavorite(tag) {
        this.props.dispatch(TagActionCreator.toggleFavorite(tag.label));
    },

    getMenuItem(tag, depth) {
        const label = tag.label;

        let selectedTagNames = null;
        if (hasValue(this.props.selectedTags)) {
            selectedTagNames = this.props.selectedTags.map(item => item.label);
        }

        // If the tag is the selected tags path, then it has a submenu.
        let getSubmenuHandler = null;
        if (hasValue(selectedTagNames) && selectedTagNames[depth] === label) {
            getSubmenuHandler = this.getSubmenu;
        } else {
            getSubmenuHandler = () => {};
        }

        let currentIndex = null;
        if (hasValue(selectedTagNames)) {
            currentIndex = selectedTagNames.indexOf(label);
        }

        // If tag is in the selected path.
        const isActive = currentIndex === depth;

        // If tag is the leaf of the selected path.
        const isLeaf = hasValue(selectedTagNames) &&
                       selectedTagNames.length === (depth + 1);

        let tagsInUrl = [];
        if (hasValue(selectedTagNames)) {
            tagsInUrl = selectedTagNames.slice(0, depth);
        }

        // Adding if (not in the list or parent of last selected tags)
        // and not the last selected tag.
        const inList =
            !_.contains(tagsInUrl, label) ||
            (hasValue(selectedTagNames) && selectedTagNames.length > depth + 1);
        const parentOfLastSelectedTags =
            hasValue(selectedTagNames) &&
            selectedTagNames.length === currentIndex + 1;
        const lastSelectedTags = currentIndex === depth;

        if (inList && !(parentOfLastSelectedTags && lastSelectedTags)) {
            tagsInUrl.push(label);
        }

        let prefix = '';
        if (this.props.isArchivedModeEnabled) {
            prefix = tagsInUrl.length > 0 ? 'archivedByTags' : 'archived';
        } else {
            prefix = tagsInUrl.length > 0 ? 'todoByTags' : '';
        }

        let url = `#${prefix}`;
        if (tagsInUrl.length > 0) {
            url = `#${prefix}/${tagsInUrl.join('/')}`;
        }

        return (
            <MenuItem
                depth={depth}
                getSubmenu={getSubmenuHandler}
                isActive={isActive}
                isSelected={isActive && isLeaf}
                key={`${label}-${depth}`}
                magic={false}
                onFavorite={this.onFavorite.bind(this, tag)}
                tag={tag}
                url={url} />
        );
    },

    getSortMenu() {
        const countClasses = styler({
            'selected-sort': this.props.sortCriterion === SortCriterions.COUNT,
        });

        const sortClasses = styler({
            'selected-sort': this.props.sortCriterion === SortCriterions.ALPHA,
        });

        const selectCriterionAlpha =
                    this.onSelectCriterion.bind(this, SortCriterions.ALPHA);

        const selectCriterionCount =
                    this.onSelectCriterion.bind(this, SortCriterions.COUNT);

        return (
            <ul className="sorts">
                <li className={sortClasses}
                    onClick={selectCriterionAlpha}>
                    <a className="fa fa-sort-alpha-asc" href="#"
                       title={t('sort numeric')}> </a>
                </li>
                <li className={countClasses} onClick={selectCriterionCount}>
                    <a className="fa fa-sort-numeric-desc" href="#"
                       title={t('sort alpha')} > </a>
                </li>
            </ul>
        );
    },

    getSubmenu(depth) {
        if (this.props.tree.length > 0) {
            const tags = this.props.tree[depth];
            let untaggedMenuItemBlock = null;
            if (depth === 0 && this.props.untaggedTasks.length > 0) {
                untaggedMenuItemBlock = this.getUntaggedMenuItem();
            }

            return (
                <ul className="submenu">
                    {untaggedMenuItemBlock}
                    {tags.map(tag => this.getMenuItem(tag, depth))}
                </ul>
            );
        }
    },

    getUntaggedMenuItem() {
        // If tag is in the selected path.
        const isActive = hasValue(this.props.selectedTags) &&
                         this.props.selectedTags.length === 0;

        let url = null;
        if (this.props.isArchivedModeEnabled) {
            url = isActive ? '#archived' : '#archivedByTags/';
        } else {
            url = isActive ? '#' : '#todoByTags/';
        }

        return (
            <MenuItem
                depth={0}
                getSubmenu={() => {}}
                isActive={isActive}
                isSelected={isActive}
                key="untagged"
                magic={true}
                tag={
                    {
                        label: t('untagged'),
                        count: this.props.untaggedTasks.length,
                        doneCount: this.props.untaggedTasks
                            .filter(task => task.done).length,
                    }
                }
                url={url} />
        );
    },

    render() {
        const archivedMenu = {
            id: 'archived',
            link: '#archived',
            label: t('archived'),
            count: this.props.numArchivedTasks,
        };

        const todoMenu = {
            id: 'tobedone',
            link: '#',
            label: t('todo'),
            count: this.props.numTasks,
        };

        let menu;
        if (this.props.isArchivedModeEnabled) {
            menu = [todoMenu, archivedMenu];
        } else {
            menu = [archivedMenu, todoMenu];
        }

        const menuBlock = this.getSortMenu();
        const submenuBlock = this.getSubmenu(0);

        return (
            <nav id="menu" role="navigation">
                <i className="fa fa-arrow-left"
                   onClick={this.props.onOpenMenu} />
                <ul>
                    <li className="first-level" id={menu[0].id}>
                        <a href={menu[0].link}>
                            {`${menu[0].label} (${menu[0].count})`}
                        </a>
                    </li>
                    <li className="first-level active" id={menu[1].id}>
                        <a href={menu[1].link}>
                            {`${menu[1].label} (${menu[1].count})`}
                        </a>
                        {menuBlock}
                        {submenuBlock}
                    </li>
                </ul>
            </nav>
        );
    },
});
