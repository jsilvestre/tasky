# UI components
React = require 'react/addons'
{div, p, nav} = React.DOM

Menu = React.createFactory require './menu'
TaskList = React.createFactory require './task-list'
Router = require 'react-router'

# Stores
TaskStore = require '../stores/TaskStore'
TagStore = require '../stores/TagStore'

styler = require 'classnames'

# Mixins
StoreWatchMixin = require '../mixins/store_watch_mixin'

module.exports = React.createClass
    displayName: 'Application'

    mixins: [
        StoreWatchMixin([TagStore, TaskStore])
        Router.State
        Router.Navigation
    ]

    # Executed only once at startup.
    componentWillMount: ->
        # Go to favorite search unless there is no or the user didn't load the
        # home page.
        favoriteSearch = TagStore.getFavoriteSearch()
        if @isActive('main') and favoriteSearch?
            url = favoriteSearch.map (tag) ->
                prefix = if tag.isExcluded then "!" else ""
                return "#{prefix}#{tag.label}"

            @replaceWith 'todoByTags', splat: url.join('/')


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
