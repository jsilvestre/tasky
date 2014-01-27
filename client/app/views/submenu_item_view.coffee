BaseView = require '../lib/base_view'

module.exports = class SubmenuItemView extends BaseView

    tagName: 'li'
    template: require './templates/menu_item'

    events: 'click': 'onClick'

    afterRender: ->
        if _.contains @model.get('selectedTags'), @model.get('tagName')
            @$el.addClass 'selected'

    getRenderData: ->
        params = super()
        _.extend params, url: @buildUrl()
        return params

    buildUrl: ->
        tagsInUrl = _.clone @model.get('selectedTags')
        if not _.contains tagsInUrl, @model.get('tagName')
            tagsInUrl.push @model.get('tagName')
        else if _.contains tagsInUrl, @model.get('tagName')
            tagsInUrl = _.without tagsInUrl, @model.get('tagName')

        url = "#byTags"
        tagsInUrl.forEach (item) =>
            url = "#{url}/#{item}"

        return url

    onClick: ->
        isActivated = @$el.hasClass 'selected'

        if isActivated
            @trigger 'unselect', @model.get('tagName')
            @$el.removeClass 'selected'
        else
            @trigger 'select', @model.get('tagName')
            @$el.addClass 'selected'


