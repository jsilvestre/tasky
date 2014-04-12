TaskCollection = require './tasks'

module.exports = class ArchivedTaskCollection extends TaskCollection

    comparator: (a, b) ->
        if a.get('completionDate') > b.get('completionDate')
            return -1
        else if a.get('completionDate') is b.get('completionDate')
            return 0
        else return 1
