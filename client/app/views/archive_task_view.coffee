TaskView = require './task_view'

module.exports = class ArchiveTaskView extends TaskView

    tagName: 'li'
    className: 'task archive done'
    template: require './templates/task_archive'

    getRenderData: ->
        date = Date.create @model.get 'completionDate'
        return _.extend super(),
            competionDate: date.format "{dd}/{MM}/{yyyy} at {HH}:{mm}"

    afterRender: -> # noop

    onClick: ->
        @model.set 'done', false
        @model.set 'completionDate', null
        @model.set 'isArchived', false
        @model.save()
        # switch to the top of base collection
        @render()

    onMouseEnter: ->
        button = @$ 'button'
        if @model.get 'done' then button.html 'Restore?'

    onMouseLeave: ->
        button = @$ 'button'
        if @model.get 'done' then button.html 'Done'



