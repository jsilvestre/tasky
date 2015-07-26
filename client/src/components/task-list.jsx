"use strict";

import * as React from "react/addons";

import * as hasValue from "../utils/hasValue";
import {buildTagsList} from "../utils/TaskUtil";

import * as TaskActionCreator from "../actions/TaskActionCreator";

import * as BreadcrumbComponent from "./breadcrumb";
import * as TaskComponent from "./task";
import * as ActionBarComponent from "./actions-bar";
import * as ProgressBarComponent from "./progress-bar";
const Breadcrumb = React.createFactory(BreadcrumbComponent);
const Task = React.createFactory(TaskComponent);
const ActionBar = React.createFactory(ActionBarComponent);
const ProgressBar = React.createFactory(ProgressBarComponent);

export const TaskList = React.createClass({
    displayName: "TaskList",

    propTypes: {
        favoriteSearch: React.PropTypes.string.isRequired,
        isArchivedMode: React.PropTypes.bool.isRequired,
        onOpenMenu: React.PropTypes.bool.isRequired,
        searchQuery: React.PropTypes.string,
        selectedTags: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        tasksDone: React.PropTypes.array.isRequired
    },

    getInitialState() {
        return {focusIndex: 0};
    },

    generateDefaultValue() {
        let tagsList = buildTagsList(this.props.selectedTags, {tagPrefix: "#"});
        if(tagsList !== "") {
            tagsList = "#{tagsList} ";
        }

        return tagsList;
    },

    generatePlaceholder() {
        const options = {
            tagPrefix: "#",
            regularSeparator: ", ",
            lastSeparator: ` ${t("and")} `
        };
        let tagsList = buildTagsList(this.props.selectedTags, options);

        if(tagsList.length > 0) {
            return t("form headline tags", {tagsList: tagsList});
        }
        else {
            return t("form headline");
        }
    },

    // Helper to avoid adding all the handlers in every invokation.
    getRenderTask(options) {
        const currentTask = options.task || null;
        options.newTaskHandler = this.newTaskHandler.bind(this, currentTask);
        options.moveFocusUpHandler = this.moveFocusUpHandler
                                        .bind(this, currentTask);
        options.moveFocusDownHandler = this.moveFocusDownHandler
                                        .bind(this, currentTask);
        options.setFocusHandler = this.setFocusHandler;

        if(hasValue(currentTask)) {
            options.removeHandler = this.removeTaskHandler
                                    .bind(this, currentTask);
            options.saveHandler = this.saveTaskHandler
                                    .bind(this, currentTask);
            options.moveUpHandler = this.moveTaskUpHandler
                                    .bind(this, currentTask);
            options.moveDownHandler = this.moveTaskDownHandler
                                    .bind(this, currentTask);
            options.toggleStateHandler = this.toggleStateHandler
                                    .bind(this, currentTask);
            options.restoreTaskHandler = this.restoreTaskHandler
                                    .bind(this, currentTask);
        }
        else {
            const noop = function noop() {};
            // Those handlers shouldn't do anything in the task form.
            options.removeHandler = noop;
            options.saveHandler = noop;
            options.moveUpHandler = noop;
            options.moveDownHandler = noop;
            options.toggleStateHandler = noop;
            options.restoreTaskHandler = noop;
        }

        return <Task {...options} />;
    },

    // Moves the focus to the next task.
    moveFocusDownHandler() {
        let newIndex;
        const listLength = this.props.tasks.length;
        if(this.state.focusIndex < listLength) {
            newIndex = this.state.focusIndex + 1;
        }
        else {
            newIndex = listLength;
        }

        this.setState({focusIndex: newIndex});
    },

    // Moves the focus to the previous task.
    moveFocusUpHandler() {
        let newIndex;
        if(this.state.focusIndex > 0) {
            newIndex = this.state.focusIndex - 1;
        }
        else {
            newIndex = 0;
        }

        this.setState({focusIndex: newIndex});
    },

    moveTaskDownHandler(task) {
        TaskActionCreator.moveDown(task);
        this.moveFocusDownHandler();
    },

    moveTaskUpHandler(task) {
        TaskActionCreator.moveUp(task);

        // Only move the focus to another task, not the form.
        if(this.state.focusIndex !== 1) {
            this.moveFocusUpHandler();
        }
    },


    newTaskHandler(previousTask, content = "") {
        if(content.length === 0) {
            content = this.generateDefaultValue();
        }

        TaskActionCreator.createTask(content, previousTask);
    },

    removeTaskHandler(task) {
        /* Removing a task mechanically moves the focus down
         we move it up unless this is the first task of the list and that there
         is more than one task in the said list (don't go to the form unless
         it's the only thing we can do). */
        if(this.state.focusIndex !== 1 || (this.props.tasks.length - 1) === 0) {
            this.moveFocusUpHandler();
        }

        TaskActionCreator.removeTask(task);
    },

    restoreTaskHandler(task) {
        TaskActionCreator.restoreTask(task);
    },

    saveTaskHandler(task, newContent) {
        TaskActionCreator.editTask(task, newContent);
    },

    // Sets the focus to the specified task.
    setFocusHandler(index) {
        let newIndex;
        if(hasValue(index) && index >= 0) {
            newIndex = index;
        }
        else {
            newIndex = -1;
        }

        this.setState({focusIndex: newIndex});
    },

    toggleStateHandler(task, isDone) {
        TaskActionCreator.toggleState(task, isDone);
    },

    render() {

        let newTaskFormBlock = null;
        let actionBarBlock = null;
        let progressBarBlock = null;
        if(!this.props.isArchivedMode) {
            newTaskFormBlock = this.getRenderTask({
                id: "new-task",
                key: "new-task",
                index: 0,
                placeholder: this.generatePlaceholder(),
                defaultValue: this.generateDefaultValue(),
                isFocus: this.state.focusIndex === 0});

            actionBarBlock = (
                <ActionBar favoriteSearch={this.props.favoriteSearch}
                    selectedTags={this.props.selectedTags}
                    tasksDone={this.props.tasksDone} />
            );

            progressBarBlock = (
                <ProgressBar tasks={this.props.tasks}
                    tasksDone={this.props.tasksDone} />
            );
        }


        return (
            <div role="main">
                <Breadcrumb
                    isArchivedMode={this.props.isArchivedMode}
                    onOpenMenu={this.props.onOpenMenu}
                    searchQuery={this.props.searchQuery}
                    selectedTags={this.props.selectedTags} />
                {newTaskFormBlock}
                <ul id="task-list">
                    {
                        this.props.tasks.map((task, index) => {
                            // `index + 1` because the new task form counts as a
                            // task.
                            index = index + 1;
                            return this.getRenderTask({
                                key: "task-c#{task.cid}",
                                index: index,
                                task: task,
                                defaultValue: this.generateDefaultValue(),
                                isFocus: index === this.state.focusIndex,
                                isArchivedMode: this.props.isArchivedMode});
                        })
                    }
                </ul>
                {actionBarBlock}
                {progressBarBlock}
            </div>
        );
    }
});
