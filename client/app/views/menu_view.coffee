BaseView = require '../lib/base_view'

MenuItemView = require './menu_item_view'

module.exports = class MenuView extends BaseView

    el: '#menu'
    template: require './templates/menu'

    views: null
    collectionEl: 'ul.tags'

    activeTags: null
    subMenuHandler: null

    events:
        'click #sortalpha': 'onSortAlpha'
        'click #sortcount': 'onSortCount'

    defaultSortCriteria: 'count'
    onSortAlpha: () ->
        if @sortCriteria isnt 'alpha'
            @sortCriteria = 'alpha'
            @render()
    onSortCount: () ->
        if @sortCriteria isnt 'count'
            @sortCriteria = 'count'
            @render()

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @archivedCollection = options.archivedCollection
        @views = new Backbone.ChildViewContainer()
        @sortCriteria = @defaultSortCriteria
        super options

    initialize: (options) ->
        @listenTo @baseCollection,
            'add': @onChange
            'change': @onChange
            'remove': @onChange

        @listenTo @archivedCollection,
            'add': @onChange
            'change': @onChange
            'remove': @onChange

        super options

    getRenderData: ->

        if @archivedCollection.length > 1000 then archivedCount = 'Over 9000++'
        else archivedCount = @archivedCollection.length

        # return
        allCount: @baseCollection.length
        untaggedCount: @baseCollection
                            .filter((task) ->
                                task.get('tags').length is 0
                            ).length
        archivedCount: archivedCount

    beforeRender: ->
        tagsList = @baseCollection.getAllTags @sortCriteria
        @views.forEach (taskView) =>
            if tagsList.indexOf(taskView.model.get('tagName')) isnt -1
                taskView.$el.detach()
            else
                @stopListening taskView
                @views.remove taskView
                taskView.destroy()

    afterRender: ->
        typeViewEl = @$ "#{@viewType}"
        submenuEl = @$ "#{@viewType} > .submenu"

        if @viewType is "#tobedone" then @collection = @baseCollection
        else @collection = @archivedCollection

        # Rendering the "magic" tag: untagged
        # Must be re-thought if more magic tags are added
        untaggedNum = @collection
            .filter((task) ->
                task.get('tags').length is 0
            ).length
        if untaggedNum > 0
            template = require './templates/menu_item'
            if @viewType is "#tobedone" then prefix = 'todoByTags'
            else prefix = 'archivedByTags'
            if @searchQuery?
                search = ";search/#{@searchQuery}"
            else
                search = ''
            isActive = if @activeTags?.length is 0 then " active selected" else ""
            untaggedView = $ '<li class="menu-tag magic' + isActive + '"></li>'
            untaggedViewContent = template
                url: "##{prefix}/#{search}"
                model:
                    tagName: t 'untagged'
                    count: untaggedNum
            untaggedView.append untaggedViewContent
            submenuEl.append untaggedView

        if @viewType is "#tobedone"
            archivedListEl = @$ '#archived'
            @$('ul:first-child').prepend archivedListEl

        tags = @collection.getAllTags @sortCriteria
        tags.forEach (tagInfo) =>
            menuItem = new MenuItemView
                            model: new Backbone.Model
                                tagName: tagInfo.get 'id'
                                count: tagInfo.get 'count'
                                isMagic: tagInfo.get 'isMagic'
                            selectedTags: @activeTags
                            depth: 0
                            viewType: @viewType
                            sortCriteria: @sortCriteria
                            baseCollection: @baseCollection
                            archivedCollection: @archivedCollection

            @views.add menuItem
            submenuEl.append menuItem.render().$el

        typeViewEl.addClass 'active'
        typeViewEl.addClass 'selected' unless @activeTags?
        return @$el

    onChange: -> @render()
    setActive: (tags) -> @activeTags = tags
    setViewType: (viewType) -> @viewType = viewType
