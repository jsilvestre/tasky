_ = require 'underscore'

# weird stuff are for accentated characters
# see http://stackoverflow.com/questions/1073412/javascript-validation-issue-with-international-characters
regex = /(^|\s)#([\w\d\-_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)(?=\s|$)/g

module.exports.containsTags = (task, tags) ->
    if tags.length is 0
        return task.tags.length is 0
    else
        lowerCasedTags = task.tags.map (tag) -> tag.toLowerCase()
        _.every tags, _.partial(_.contains, lowerCasedTags)

module.exports.doesntContainsTags = (task, tags) ->
    # no task to exclude, it cannot contain it
    if tags.length is 0
        return true
    else
        lowerCasedTags = task.tags.map (tag) -> tag.toLowerCase()
        return not _.some tags, _.partial(_.contains, lowerCasedTags)

# helper function to extract tag from description
module.exports.extractTags = (desc) ->
    tags = desc.match regex
    tags = _.map tags, (tag) -> tag.trim().replace('#', '').toLowerCase()
    tags = _.uniq tags
    return tags

module.exports.getNewOrder = (previousTask, nextTask) ->
    topBoundary = if nextTask? then nextTask.order else Number.MAX_VALUE
    lowBoundary = if previousTask? then previousTask.order else 0.0

    step = (topBoundary - lowBoundary) / 2
    order = lowBoundary + step

    return {order, step}

module.exports.buildTagsList = (tags, options = {}) ->

    tagPrefix = options.tagPrefix or ''
    regularSeparator = options.regularSeparator or ' '
    lastSeparator = options.lastSeparator or ' '

    return "" if not tags?
    tagsList = ""
    includedTags = tags
        .filter (tag) -> not tag.isExcluded
        .map (tag) -> tag.label

    includedTags.forEach (tag) ->
        if includedTags.indexOf(tag) is 0
            tagsList = "#{tagPrefix}#{tag}"
        else if includedTags.indexOf(tag) is (includedTags.length - 1)
            tagsList = "#{tagsList}#{lastSeparator}#{tagPrefix}#{tag}"
        else
            tagsList = "#{tagsList}#{regularSeparator}#{tagPrefix}#{tag}"
    return tagsList
