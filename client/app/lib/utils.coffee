module.exports.buildTagsList = (tags, options = {}) ->

    tagPrefix = options.tagPrefix or ''
    regularSeparator = options.regularSeparator or ' '
    lastSeparator = options.lastSeparator or ' '

    return "" if not tags?
    tagsList = ""
    tags.forEach (tag) ->
        if tags.indexOf(tag) is 0
            tagsList = "#{tagPrefix}#{tag}"
        else if tags.indexOf(tag) is (tags.length - 1)
            tagsList = "#{tagsList}#{lastSeparator}#{tagPrefix}#{tag}"
        else
            tagsList = "#{tagsList}#{regularSeparator}#{tagPrefix}#{tag}"
    return tagsList