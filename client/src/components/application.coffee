# UI components
React = require 'react/addons'
{div, p, nav} = React.DOM

Menu = React.createFactory require './menu'
TaskList = React.createFactory require './task-list'

# Stores
TaskStore = require '../stores/TaskStore'
TagStore = require '../stores/TagStore'

styler = require 'classnames'

# Mixins
StoreWatchMixin = require '../mixins/store_watch_mixin'

module.exports = React.createClass
    displayName: 'Application'

    mixins: [StoreWatchMixin([TagStore, TaskStore])]

    getStateFromStores: ->
        selectedTags = TagStore.getSelected()
        tasks = TaskStore.getByTags selectedTags

        tasks: tasks
        selectedTags: selectedTags
        tagTree: TagStore.getTree()
        sortCriterion: TagStore.getSortCriterion()
        isArchivedMode: TaskStore.isArchivedMode()
        untaggedTasks: TaskStore.getUntagged()
        numTasks: TaskStore.getNumTasks()
        numArchivedTasks: TaskStore.getNumArchivedTasks()
        searchQuery: TaskStore.getSearchQuery()
        tasksDone: tasks.filter (task) -> task.done
        isReindexing: TaskStore.isReindexing()
        favoriteSearch: TagStore.getFavoriteSearch()

    render: ->

        appStyles = styler
            'menuOpen': @state.isMenuOpen

        div role: 'application', className: appStyles,
            Menu
                selectedTags: @state.selectedTags
                tree: @state.tagTree
                sortCriterion: @state.sortCriterion
                isArchivedMode: @state.isArchivedMode
                untaggedTasks: @state.untaggedTasks
                numTasks: @state.numTasks
                numArchivedTasks: @state.numArchivedTasks
                onOpenMenu: @openMenu
            div className: 'container',
                TaskList
                    selectedTags: @state.selectedTags
                    tasks: @state.tasks
                    isArchivedMode: @state.isArchivedMode
                    searchQuery: @state.searchQuery
                    tasksDone: @state.tasksDone
                    onOpenMenu: @openMenu
                    favoriteSearch: @state.favoriteSearch
            if @state.isReindexing
                div id: 'block'
                div id: 'modal',
                    p null, t 'reindexing message'

    getInitialState: -> isMenuOpen: false

    openMenu: ->
        isMenuOpen = not @state.isMenuOpen
        @setState {isMenuOpen}
