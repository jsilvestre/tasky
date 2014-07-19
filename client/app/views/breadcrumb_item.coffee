BaseView = require '../lib/base_view'
Utils = require '../lib/utils'
app = require '../application'
Task = require '../models/task'

module.exports = class BreadcrumbItemView extends BaseView

    tagName: 'div'
    className: 'breadcrumb-item'
    template: (value) -> """
    <span>#{value}</span><a>×</a>
    """

    events:
        'mouseover a': 'onRemoveHovered'
        'mouseout a': 'onRemoveHovered'
        'click a': 'onRemoveClicked'
        'click span': 'onClicked'

    constructor: (options) ->
        @type = options.type


        if options.type is 'tag'
            if options.model.indexOf('!') is 0
                @className = "#{@className} excluded"
            else
                @className = "#{@className}"

        super options

    getRenderData: ->
        if @type is 'tag'
            if @model.indexOf('!') is 0
                return "##{@model.substr 1}"
            else
                return "##{@model}"
        else
            return "\"#{@model}\""

    onRemoveHovered: -> @$el.toggleClass 'notice-delete-action'

    onRemoveClicked: ->
        @$el.fadeOut =>
            @destroy()
            @trigger 'remove'

    onClicked: (evt) ->
        if @model.indexOf('!') is 0
            @model = @model.substr 1
        else
            @model = "!#{@model}"
        @trigger 'change'
