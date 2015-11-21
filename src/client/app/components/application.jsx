import styler from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import {
    visibleTasksSelector,
    visibleTasksDoneSelector
} from '../selectors/TaskSelectors';

import {
    treeSelector
} from '../selectors/TagSelectors';

import Menu from './menu';
import TaskList from './task-list';

import {SortCriterions} from '../constants/AppConstants';

const SortCriterionsValue = Object.keys(SortCriterions)
                            .map(criterion => SortCriterions[criterion]);

const Application = React.createClass({
    displayName: 'Application',

    propTypes: {
        dispatch: React.PropTypes.func.isRequired,
        favoriteSearch: React.PropTypes.array,
        isArchivedModeEnabled: React.PropTypes.bool.isRequired,
        numArchivedTasks: React.PropTypes.number.isRequired,
        numTasks: React.PropTypes.number.isRequired,
        searchQuery: React.PropTypes.string,
        selectedTags: React.PropTypes.array,
        sortCriterion: React.PropTypes.oneOf(SortCriterionsValue).isRequired,
        tasks: React.PropTypes.array.isRequired,
        tasksDone: React.PropTypes.array.isRequired,
        tree: React.PropTypes.array.isRequired,
        untaggedTasks: React.PropTypes.array.isRequired,
    },

    getInitialState() {
        return { isMenuOpen: false };
    },

    // Executed only once at startup.
    componentWillMount() {
        // Go to favorite search unless there is no or the user didn't load the
        // home page.
        /*
        const favoriteSearch = TagStore.getFavoriteSearch();
        if(this.isActive("main") &&
            favoriteSearch !== null &&
            favoriteSearch !== void 0) {
            const url = favoriteSearch.map(tag => {
                const prefix = tag.isExcluded ? "!" : "";
                return `${prefix}${tag.label}`;
            });

            this.replaceWith("todoByTags", {splat: url.join("/")});
        }*/

    },

    openMenu() {
        const isMenuOpen = !this.state.isMenuOpen;
        this.setState({isMenuOpen: isMenuOpen});
    },

    render() {
        const styles = styler({
            'menuOpen': this.state.isMenuOpen,
        });

        let reindexerBlock;
        if (this.state.isReindexing) {
            reindexerBlock = (
                <div>
                    <div id="block"></div>
                    <div id="modal">
                        <p>t('reindexing message')</p>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles} role="application">
                <Menu
                    dispatch={this.props.dispatch}
                    isArchivedModeEnabled={this.props.isArchivedModeEnabled}
                    numArchivedTasks={this.props.numArchivedTasks}
                    numTasks={this.props.numTasks}
                    onOpenMenu={this.openMenu}
                    selectedTags={this.props.selectedTags}
                    sortCriterion={this.props.sortCriterion}
                    tree={this.props.tree}
                    untaggedTasks={this.props.untaggedTasks} />
                <div className="container">
                    <TaskList
                        dispatch={this.props.dispatch}
                        favoriteSearch={this.props.favoriteSearch}
                        isArchivedModeEnabled={this.props.isArchivedModeEnabled}
                        onOpenMenu={this.openMenu}
                        searchQuery={this.props.searchQuery}
                        selectedTags={this.props.selectedTags}
                        tasks={this.props.tasks}
                        tasksDone={this.props.tasksDone} />
                </div>
                {reindexerBlock}
            </div>
        );
    },
});

function mapStateToProps(state) {
    return _.extend(
        {},
        state,
        {
            numTasks: state.tasks.length,
            numArchivedTasks: state.archivedTasks.length,
        },
        visibleTasksSelector(state),
        visibleTasksDoneSelector(state),
        {
            tree: treeSelector(state),
        }
    );
}

export default connect(mapStateToProps)(Application);
