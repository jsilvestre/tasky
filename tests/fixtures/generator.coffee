fs = require 'fs'

possibleTags = [
    'test'
    'url'
    'other'
    'vacances'
    'cozy'
    'boulot'
    'personnel'
    'files'
    'calendar'
    'tasky'
    'react'
    'webdev'
    'liens'
    'photos'
    'data-system'
    'doc'
    'community'
    'urgent'
    'important'
]

getRandom = (max) -> Math.round Math.random() * max
getRandomElmt = (array) -> array[getRandom(array.length - 1)]


tasksNum = 5000
tasks = []
for j in [0..tasksNum - 1]

    tagsNum = getRandom(possibleTags.length) % 6

    tags = []
    for i in [1..tagsNum]
        tag = getRandomElmt possibleTags
        while tag in tags
            tag = getRandomElmt possibleTags

        tags.push tag


    content = "##{tags.join ' #'}"

    tasks.push
        description: content
        tags: tags
        order: i * 15000
        isArchived: false
        createDate: new Date().toISOString()
        docType: 'Tasky'


targetFile = './tests/fixtures/tasks_generated.json'
json = JSON.stringify tasks, null, '  '
fs.writeFile targetFile, json, flag: 'w', (err) ->
    console.log err if err?
console.log "Done generating #{tasksNum} tasks"

