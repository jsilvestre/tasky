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
        'click': 'onClicked'

    constructor: (options) ->
        super options
        @type = options.type

        if options.type is 'tag'
            @className = "#{@className} tag"
        else
            @className = "#{@className} search"

    getRenderData: ->
        if @type is 'tag'
            return "##{@model}"
        else
            return "\"#{@model}\""

    onRemoveHovered: -> @$el.toggleClass 'notice-delete-action'

    onRemoveClicked: ->
        @$el.fadeOut =>
            @destroy()
            @trigger 'remove'

    onClicked: ->
        console.log "something coming soon :)"
