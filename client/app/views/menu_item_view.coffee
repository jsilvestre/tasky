BaseView = require '../lib/base_view'

TagsCollection = require '../collections/tags'

module.exports = class MenuItemView extends BaseView

    tagName: 'li'
    className: 'menu-tag'
    template: require './templates/menu_item'
    collectionEl: 'ul.submenu'
    views: null
    events: 'click': 'onClick'

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @selectedTags = options.selectedTags
        @depth = options.depth
        @views = new Backbone.ChildViewContainer()
        super options

    getRenderData: ->
        params = super()
        _.extend params, url: @buildUrl()
        return params

    buildUrl: ->
        tagsInUrl = _.clone @selectedTags

        if @depth is 0 # root
            if _.contains tagsInUrl, @model.get 'tagName'
                url = "#"
            else
                url = "#byTags/#{@model.get('tagName')}"
        else
            tagsInUrl = @selectedTags.slice 0, @depth

            if not _.contains(tagsInUrl, @model.get 'tagName') \
            or @selectedTags?.length > @depth + 1
                tagsInUrl.push @model.get 'tagName'
            else if _.contains tagsInUrl, @model.get 'tagName'
                tagsInUrl = _.without tagsInUrl, @model.get 'tagName'

            url = "#"
            if tagsInUrl.length > 0
                url = "#{url}byTags"
                tagsInUrl.forEach (item) -> url = "#{url}/#{item}"

        return url


    afterRender: ->
        currentIndex = @selectedTags?.indexOf @model.get 'tagName'
        if  currentIndex is @depth then @$el.addClass 'selected'

        leftPadding = (@depth + 1) * 25
        @$('a').css 'padding-left', leftPadding

        if @selectedTags? and @selectedTags[@depth] is @model.get('tagName')
            tags = @buildTagsList()
            tags.forEach (tagInfo) =>
                menuItem = new MenuItemView
                                model: new Backbone.Model
                                    tagName: tagInfo.get 'id'
                                    count: tagInfo.get 'count'
                                selectedTags: @selectedTags
                                depth: @depth + 1
                                baseCollection: @baseCollection
                @views.add menuItem
                @$el.children(@collectionEl).append menuItem.render().$el


    buildTagsList: ->
        excludedItems = @selectedTags or []
        excludedItems = excludedItems.slice 0, @depth + 1

        includedTags = @selectedTags or []
        includedTags = includedTags.slice 0, @depth + 1

        delete @collection if @collection?
        @collection = @baseCollection.getByTags includedTags
        tagsList = TagsCollection.extractFromTasks @collection,
                                                    excludedItems,
                                                    @selectedTags

        return tagsList
