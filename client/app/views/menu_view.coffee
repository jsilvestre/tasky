BaseView = require '../lib/base_view'

MenuItemView = require './menu_item_view'

module.exports = class MenuView extends BaseView

    el: '#menu'
    template: require './templates/menu'

    events: 'click li.first-level': 'onClick'

    views: null
    collectionEl: 'ul.tags'

    activeTags: null
    subMenuHandler: null

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @archivedCollection = options.archivedCollection
        @views = new Backbone.ChildViewContainer()
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
        tagsList = @baseCollection.getAllTags()
        @views.forEach (taskView) =>
            if tagsList.indexOf(taskView.model.get('tagName')) isnt -1
                taskView.$el.detach()
            else
                @stopListening taskView
                @views.remove taskView
                taskView.destroy()

    afterRender: ->
        tags = @baseCollection.getAllTags()
        tags.forEach (tagInfo) =>
            menuItem = new MenuItemView
                            model: new Backbone.Model
                                tagName: tagInfo.get 'id'
                                count: tagInfo.get 'count'
                            selectedTags: @activeTags
                            depth: 0
                            baseCollection: @baseCollection
            @views.add menuItem
            $(@collectionEl).append menuItem.render().$el

        if @highlightedItem?
            selector = ".permanent li:nth-of-type(#{@highlightedItem})"
            @$el.find(selector).addClass 'selected'
        return @$el

    onChange: ->
        @render()

    setActive: (tags) ->
        @activeTags = tags
        @render()

    setHighlightedItem: (highlightedItem) ->
        @highlightedItem = highlightedItem

