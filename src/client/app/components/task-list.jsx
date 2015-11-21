import React from 'react';
import * as TaskActionCreator from '../actions/TaskActionCreator';
import hasValue from '../utils/hasValue';
import { buildTagsList } from '../utils/TaskUtil';

import Breadcrumb from './breadcrumb';
import Task from './task';
import ActionBar from './actions-bar';

export default React.createClass({
    displayName: 'TaskList',

    propTypes: {
        dispatch: React.PropTypes.func.isRequired,
        favoriteSearch: React.PropTypes.array,
        isArchivedModeEnabled: React.PropTypes.bool.isRequired,
        onOpenMenu: React.PropTypes.func.isRequired,
        searchQuery: React.PropTypes.string,
        selectedTags: React.PropTypes.array,
        tasks: React.PropTypes.array.isRequired,
        tasksDone: React.PropTypes.array.isRequired,
    },

    getInitialState() {
        return {focusIndex: 0};
    },

    // Sets the focus to the specified task.
    setFocusHandler(index) {
        let newIndex;
        if (hasValue(index) && index >= 0) {
            newIndex = index;
        } else {
            newIndex = -1;
        }

        this.setState({focusIndex: newIndex});
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

        if (hasValue(currentTask)) {
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
        } else {
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

    generateDefaultValue() {
        let tagsList = buildTagsList(this.props.selectedTags, {tagPrefix: '#'});
        if (tagsList !== '') {
            tagsList = `${tagsList} `;
        }

        return tagsList;
    },

    generatePlaceholder() {
        const options = {
            tagPrefix: '#',
            regularSeparator: ', ',
            lastSeparator: ` ${t('and')} `,
        };
        const tagsList = buildTagsList(this.props.selectedTags, options);

        let result;
        if (tagsList.length > 0) {
            result = t('form headline tags', {tagsList: tagsList});
        } else {
            result = t('form headline');
        }

        return result;
    },

    // Moves the focus to the next task.
    moveFocusDownHandler() {
        let newIndex;
        const listLength = this.props.tasks.length;
        if (this.state.focusIndex < listLength) {
            newIndex = this.state.focusIndex + 1;
        } else {
            newIndex = listLength;
        }

        this.setState({focusIndex: newIndex});
    },

    // Moves the focus to the previous task.
    moveFocusUpHandler() {
        let newIndex;
        if (this.state.focusIndex > 0) {
            newIndex = this.state.focusIndex - 1;
        } else {
            newIndex = 0;
        }

        this.setState({focusIndex: newIndex});
    },

    moveTaskDownHandler(task) {
        this.props.dispatch(TaskActionCreator.moveDown(task));
        this.moveFocusDownHandler();
    },

    moveTaskUpHandler(task) {
        this.props.dispatch(TaskActionCreator.moveUp(task));

        // Only move the focus to another task, not the form.
        if (this.state.focusIndex !== 1) {
            this.moveFocusUpHandler();
        }
    },


    newTaskHandler(previousTask, content = '') {
        let taskContent = content;
        if (taskContent.length === 0) {
            taskContent = this.generateDefaultValue();
        }

        const action = TaskActionCreator.persistNewTask(content, previousTask);
        this.props.dispatch(action);
    },

    removeTaskHandler(task) {
        /* Removing a task mechanically moves the focus down
         we move it up unless this is the first task of the list and there is
         more than one task in the said list (don't go to the form unless it's
         the only thing we can do). */
        const isFirstTask = this.state.focusIndex === 1;
        const hasMoreThanOneTask = this.props.tasks.length > 1;
        if (!isFirstTask && hasMoreThanOneTask) {
            this.moveFocusUpHandler();
        }

        this.props.dispatch(TaskActionCreator.removeTask(task));
    },

    restoreTaskHandler(task) {
        this.props.dispatch(TaskActionCreator.restoreTask(task));
    },

    saveTaskHandler(task, newContent) {
        this.props.dispatch(TaskActionCreator.editTask(task, newContent));
    },

    toggleStateHandler(task, isDone) {
        this.props.dispatch(TaskActionCreator.toggleState(task, isDone));
    },

    render() {
        let newTaskFormBlock = null;
        let actionBarBlock = null;
        if (!this.props.isArchivedModeEnabled) {
            newTaskFormBlock = this.getRenderTask({
                id: 'new-task',
                key: 'new-task',
                index: 0,
                placeholder: this.generatePlaceholder(),
                defaultValue: this.generateDefaultValue(),
                isFocus: this.state.focusIndex === 0,
            });

            actionBarBlock = (
                <ActionBar
                    dispatch={this.props.dispatch}
                    favoriteSearch={this.props.favoriteSearch}
                    selectedTags={this.props.selectedTags}
                    tasksDone={this.props.tasksDone} />
            );
        }


        const {isArchivedModeEnabled} = this.props;
        return (
            <div role="main">
                <Breadcrumb
                    isArchivedModeEnabled={this.props.isArchivedModeEnabled}
                    onOpenMenu={this.props.onOpenMenu}
                    searchQuery={this.props.searchQuery}
                    selectedTags={this.props.selectedTags} />
                {newTaskFormBlock}
                <ul id="task-list">
                    {
                        this.props.tasks.map((task, index) => {
                            // `index + 1` because the new task form counts as a
                            // task.
                            const newIndex = index + 1;
                            return this.getRenderTask({
                                key: `task-c${task.cid}`,
                                index: newIndex,
                                task: task,
                                defaultValue: this.generateDefaultValue(),
                                isFocus: newIndex === this.state.focusIndex,
                                isArchivedModeEnabled});
                        })
                    }
                </ul>
                {actionBarBlock}
            </div>
        );
    },
});
