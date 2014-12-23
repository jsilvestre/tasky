module.exports =

    ActionTypes:
        'SELECT_TAGS'            : 'SELECT_TAGS'
        'CREATE_TASK'            : 'CREATE_TASK'
        'EDIT_TASK'              : 'EDIT_TASK'
        'REMOVE_TASK'            : 'REMOVE_TASK'
        'REORDER_TASK'           : 'REORDER_TASK'
        'SELECT_SORT_CRITERION'  : 'SELECT_SORT_CRITERION'
        'SET_ARCHIVED_MODE'      : 'SET_ARCHIVED_MODE'
        'SET_SEARCH_QUERY'       : 'SET_SEARCH_QUERY'
        'ARCHIVE_TASK'           : 'ARCHIVE_TASK'
        'RESTORE_TASK'           : 'RESTORE_TASK'
        'SET_REINDEX_STATE'      : 'SET_REINDEX_STATE'
        'TOGGLE_FAVORITE_TAG'    : 'TOGGLE_FAVORITE_TAG'

    KeyboardKeys:
        'ENTER'         : 13
        'BACKSPACE'     : 8
        'TAB'           : 9
        'SPACE'         : 32
        'ARROW_LEFT'    : 37
        'ARROW_TOP'     : 38
        'ARROW_RIGHT'   : 39
        'ARROW_DOWN'    : 40
        'V'             : 86
        'OSX_SHARP'     : 220

    SortCriterions:
        'COUNT': 'count'
        'ALPHA': 'alpha'

    PayloadSources:
        'VIEW_ACTION'   : 'VIEW_ACTION'
        'SERVER_ACTION' : 'SERVER_ACTION'

    Options:
        'SAVE_INTERVAL_TIME'    : 5000
        'MIN_STEP'              : Math.pow 10, 4
