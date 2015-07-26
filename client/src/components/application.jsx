"use strict";

import * as React from "react/addons";
import * as Router from "react-router";
import * as styler from "classnames";

import * as MenuComponent from "./menu";
import * as TaskListComponent from "./task-list";

import * as TaskStore from "../stores/TaskStore";
import * as TagStore from "../stores/TagStore";

import * as createStoreWatcher from "../mixins/store_watch_mixin";

const Menu = React.createFactory(MenuComponent);
const TaskList = React.createFactory(TaskListComponent);

export const Application = React.createClass({
    displayName: "Application",

    mixins: [
        createStoreWatcher([TagStore, TaskStore]),
        Router.State,
        Router.Navigation
    ],

    getInitialState() {
        return {isMenuOpen: false};
    },

    // Executed only once at startup.
    componentWillMount() {
        // Go to favorite search unless there is no or the user didn't load the
        // home page.
        const favoriteSearch = TagStore.getFavoriteSearch();
        if(this.isActive("main") &&
            favoriteSearch !== null &&
            favoriteSearch !== void 0) {
            const url = favoriteSearch.map(tag => {
                const prefix = tag.isExcluded ? "!" : "";
                return `${prefix}${tag.label}`;
            });

            this.replaceWith("todoByTags", {splat: url.join("/")});
        }

    },

    getStateFromStores() {
        const selectedTags = TagStore.getSelected();
        const tasks = TaskStore.getByTags(selectedTags);

        return {
            tasks: tasks,
            selectedTags: selectedTags,
            tagTree: TagStore.getTree(),
            sortCriterion: TagStore.getSortCriterion(),
            isArchivedMode: TaskStore.isArchivedMode(),
            untaggedTasks: TaskStore.getUntagged(),
            numTasks: TaskStore.getNumTasks(),
            numArchivedTasks: TaskStore.getNumArchivedTasks(),
            searchQuery: TaskStore.getSearchQuery(),
            tasksDone: tasks.filter(task => task.done),
            isReindexing: TaskStore.isReindexing(),
            favoriteSearch: TagStore.getFavoriteSearch()
        };
    },

    openMenu() {
        const isMenuOpen = !this.state.isMenuOpen;
        this.setState({isMenuOpen: isMenuOpen});
    },

    render() {
        const styles = styler({
            "menuOpen": this.state.isMenuOpen
        });

        let reindexerBlock;
        if(this.state.isReindexing) {
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
                    isArchivedMode={this.state.isArchivedMode}
                    numArchivedTasks={this.state.numArchivedTasks}
                    numTasks={this.state.numTasks}
                    onOpenMenu={this.openMenu}
                    selectedTags={this.state.selectedTags}
                    sortCriterion={this.state.sortCriterion}
                    tree={this.state.tagTree}
                    untaggedTasks={this.state.untaggedTasks} />
                <div className="container">
                    <TaskList
                        favoriteSearch={this.state.favoriteSearch}
                        isArchivedMode={this.state.isArchivedMode}
                        onOpenMenu={this.openMenu}
                        searchQuery={this.state.searchQuery}
                        selectedTags={this.state.selectedTags}
                        tasks={this.state.tasks}
                        tasksDone={this.state.tasksDone} />
                </div>
                {reindexerBlock}
            </div>
        );
    }
});
