(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("AppDispatcher", function(exports, require, module) {
var AppDispatcher, Dispatcher, PayloadSources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Dispatcher = require('./libs/flux/dispatcher/Dispatcher');

PayloadSources = require('./constants/AppConstants').PayloadSources;


/*
    Custom dispatcher class to add semantic method.
 */

AppDispatcher = (function(_super) {
  __extends(AppDispatcher, _super);

  function AppDispatcher() {
    return AppDispatcher.__super__.constructor.apply(this, arguments);
  }

  AppDispatcher.prototype.handleViewAction = function(action) {
    var payload;
    payload = {
      source: PayloadSources.VIEW_ACTION,
      action: action
    };
    return this.dispatch(payload);
  };

  AppDispatcher.prototype.handleServerAction = function(action) {
    var payload;
    payload = {
      source: PayloadSources.SERVER_ACTION,
      action: action
    };
    return this.dispatch(payload);
  };

  return AppDispatcher;

})(Dispatcher);

module.exports = new AppDispatcher();
});

;require.register("actions/TagActionCreator", function(exports, require, module) {
var ActionTypes, AppDispatcher;

AppDispatcher = require('../AppDispatcher');

ActionTypes = require('../constants/AppConstants').ActionTypes;

module.exports = {
  selectTags: function(tags) {
    return AppDispatcher.handleViewAction({
      type: ActionTypes.SELECT_TAGS,
      value: tags
    });
  },
  selectSortCriterion: function(criterion) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.SELECT_SORT_CRITERION,
      value: criterion
    });
    return localStorage.setItem('sort-criterion', criterion);
  }
};
});

;require.register("actions/TaskActionCreator", function(exports, require, module) {
var ActionTypes, AppDispatcher, Options, SELF, TagStore, TaskStore, TaskUtil, XHRUtils, _ref;

AppDispatcher = require('../AppDispatcher');

_ref = require('../constants/AppConstants'), ActionTypes = _ref.ActionTypes, Options = _ref.Options;

TaskStore = require('../stores/TaskStore');

TagStore = require('../stores/TagStore');

XHRUtils = require('../utils/XHRUtils');

TaskUtil = require('../utils/TaskUtil');

module.exports = SELF = {
  createTask: function(content, previousTask) {
    var nextIndex, nextTask, order, rawTask, step, tasks, _ref1;
    tasks = TaskStore.getAll();
    if (previousTask != null) {
      nextIndex = tasks.indexOf(previousTask) + 1;
    } else {
      nextIndex = 0;
    }
    nextTask = tasks[nextIndex];
    _ref1 = TaskUtil.getNewOrder(previousTask, nextTask), order = _ref1.order, step = _ref1.step;
    rawTask = {
      cid: TaskStore.getNextCid(),
      description: content,
      order: order,
      tags: TaskUtil.extractTags(content)
    };
    AppDispatcher.handleViewAction({
      type: ActionTypes.CREATE_TASK,
      value: {
        nextIndex: nextIndex,
        rawTask: rawTask
      }
    });
    return XHRUtils.create(rawTask, function(error, task) {
      var changes, cid;
      changes = {
        id: task.id,
        creationDate: task.creationDate,
        completionDate: task.completionDate
      };
      cid = rawTask.cid;
      AppDispatcher.handleViewAction({
        type: ActionTypes.UPDATE_TASK,
        value: {
          cid: cid,
          changes: changes
        }
      });
      if (step <= Options.MIN_STEP) {
        return SELF.reindexTasks();
      }
    });
  },
  moveUp: function(task) {
    var changedPiece, changes, cid, order, previous, previousIndex, previousIndexInSubCollection, previousOfPrevious, selectedTags, step, subCollection, tasks, _ref1;
    selectedTags = TagStore.getSelected();
    tasks = TaskStore.getAll();
    subCollection = TaskStore.getByTags(selectedTags);
    previousIndexInSubCollection = subCollection.indexOf(task) - 1;
    previous = subCollection[previousIndexInSubCollection];
    previousIndex = tasks.indexOf(previous);
    previousOfPrevious = tasks[previousIndex - 1] || null;
    if (previousIndex >= 0) {
      _ref1 = TaskUtil.getNewOrder(previousOfPrevious, previous), order = _ref1.order, step = _ref1.step;
      changedPiece = [task, previous];
      changes = {
        order: order
      };
      cid = task.cid;
      AppDispatcher.handleViewAction({
        type: ActionTypes.UPDATE_TASK,
        value: {
          cid: cid,
          changes: changes
        }
      });
      AppDispatcher.handleViewAction({
        type: ActionTypes.REORDER_TASK,
        value: {
          task: task,
          changedPiece: changedPiece,
          index: previousIndex,
          oldIndex: tasks.indexOf(task)
        }
      });
      return XHRUtils.update(task.id, changes, function(err, task) {
        if (step <= Options.MIN_STEP) {
          return SELF.reindexTasks();
        }
      });
    }
  },
  moveDown: function(task) {
    var changedPiece, changes, cid, next, nextIndex, nextIndexInSubCollection, nextOfNext, order, selectedTags, step, subCollection, tasks, _ref1;
    selectedTags = TagStore.getSelected();
    tasks = TaskStore.getAll();
    subCollection = TaskStore.getByTags(selectedTags);
    nextIndexInSubCollection = subCollection.indexOf(task) + 1;
    next = subCollection[nextIndexInSubCollection];
    nextIndex = tasks.indexOf(next);
    nextOfNext = tasks[nextIndex + 1] || null;
    if (nextIndex !== tasks.length && nextIndexInSubCollection !== subCollection.length) {
      _ref1 = TaskUtil.getNewOrder(next, nextOfNext), order = _ref1.order, step = _ref1.step;
      changedPiece = [next, task];
      changes = {
        order: order
      };
      cid = task.cid;
      AppDispatcher.handleViewAction({
        type: ActionTypes.UPDATE_TASK,
        value: {
          cid: cid,
          changes: changes
        }
      });
      AppDispatcher.handleViewAction({
        type: ActionTypes.REORDER_TASK,
        value: {
          task: task,
          changedPiece: changedPiece,
          index: nextIndex,
          oldIndex: tasks.indexOf(task)
        }
      });
      return XHRUtils.update(task.id, changes, function(err, task) {
        if (step <= Options.MIN_STEP) {
          return SELF.reindexTasks();
        }
      });
    }
  },
  editTask: function(task, newContent) {
    var changes, cid;
    changes = {
      description: newContent,
      tags: TaskUtil.extractTags(newContent)
    };
    cid = task.cid;
    AppDispatcher.handleViewAction({
      type: ActionTypes.UPDATE_TASK,
      value: {
        cid: cid,
        changes: changes
      }
    });
    return XHRUtils.update(task.id, changes, function(err, task) {});
  },
  toggleState: function(task, isDone) {
    var changes, cid, completionDate;
    if (isDone) {
      completionDate = Date.now();
    } else {
      completionDate = null;
    }
    changes = {
      done: isDone,
      completionDate: completionDate
    };
    cid = task.cid;
    AppDispatcher.handleViewAction({
      type: ActionTypes.UPDATE_TASK,
      value: {
        cid: cid,
        changes: changes
      }
    });
    return XHRUtils.update(task.id, changes, function(err, task) {});
  },
  removeTask: function(task) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.REMOVE_TASK,
      value: task
    });
    return XHRUtils.remove(task.id, function(err) {});
  },
  setArchivedMode: function(isArchived) {
    return AppDispatcher.handleViewAction({
      type: ActionTypes.SET_ARCHIVED_MODE,
      value: isArchived
    });
  },
  setSearchQuery: function(searchQuery) {
    return AppDispatcher.handleViewAction({
      type: ActionTypes.SET_SEARCH_QUERY,
      value: searchQuery
    });
  },
  archiveTasks: function(tasks) {
    return async.eachLimit(tasks, 5, function(task, callback) {
      AppDispatcher.handleViewAction({
        type: ActionTypes.ARCHIVE_TASK,
        value: task.cid
      });
      return XHRUtils.update(task.id, {
        isArchived: true
      }, function(err) {
        return callback(err);
      });
    }, function(err) {});
  },
  restoreTask: function(task) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.RESTORE_TASK,
      value: task.cid
    });
    return XHRUtils.update(task.id, {
      isArchived: false,
      done: false
    }, function(err, task) {});
  },
  reindexTasks: function() {
    AppDispatcher.handleViewAction({
      type: ActionTypes.SET_REINDEX_STATE,
      value: true
    });
    return XHRUtils.reindex(function(err, tasks) {
      location.reload();
      return AppDispatcher.handleViewAction({
        type: ActionTypes.SET_REINDEX_STATE,
        value: false
      });
    });
  }
};
});

;require.register("application", function(exports, require, module) {
module.exports = {
  initialize: function() {
    var TagStore, TaskStore, e, locales;
    this.locale = window.locale;
    delete window.locale;
    this.polyglot = new Polyglot({
      locale: this.locale
    });
    try {
      locales = require('locales/' + this.locale);
    } catch (_error) {
      e = _error;
      locales = require('locales/en');
    }
    this.polyglot.extend(locales);
    window.t = this.polyglot.t.bind(this.polyglot);
    TaskStore = require('./stores/TaskStore');
    TagStore = require('./stores/TagStore');
    this.router = require('router');
    window.router = this.router;
    Backbone.history.start();
    if (typeof Object.freeze === 'function') {
      return Object.freeze(this);
    }
  }
};
});

;require.register("components/adjustable-input", function(exports, require, module) {
var KeyboardKeys, input, span, _ref;

_ref = React.DOM, input = _ref.input, span = _ref.span;

KeyboardKeys = require('../constants/AppConstants').KeyboardKeys;

module.exports = React.createClass({
  displayName: 'AdjustableInput',
  render: function() {
    var inputAttributes, spanAttributes;
    inputAttributes = {
      style: {
        width: this.state.width
      },
      ref: 'input',
      type: 'text',
      value: this.state.content,
      onChange: this.onChange,
      onBlur: this.onBlur,
      onKeyUp: this.onKeyUp,
      className: this.props.className,
      placeholder: this.props.placeholder
    };
    spanAttributes = {
      ref: 'size-calculator',
      className: 'size-calculator'
    };
    return span(null, input(inputAttributes), span(spanAttributes, this.state.content));
  },
  onChange: function() {
    var node;
    node = this.refs['input'].getDOMNode();
    return this.setState({
      content: node.value
    });
  },
  onKeyUp: function() {
    var key;
    key = event.keyCode || event.charCode;
    if (key === KeyboardKeys.ENTER) {
      this.props.onSubmitHandler(this.state.content);
      return this.setState({
        content: ''
      });
    }
  },
  onBlur: function() {
    var node;
    node = this.refs['input'].getDOMNode();
    if (node.value.length === 0) {
      return this.setState({
        width: 150
      });
    }
  },
  componentDidUpdate: function() {
    var node, notInitialState, width;
    node = this.refs['size-calculator'].getDOMNode();
    width = node.getClientRects()[0].width;
    notInitialState = this.state.content.length > 0 || this.state.width > 150;
    if (this.state.width !== width && notInitialState) {
      return this.setState({
        width: width
      });
    }
  },
  getInitialState: function() {
    return {
      width: 150,
      content: ''
    };
  }
});
});

;require.register("components/application", function(exports, require, module) {
var Menu, StoreWatchMixin, TagStore, TaskList, TaskStore, div, p, _ref;

_ref = React.DOM, div = _ref.div, p = _ref.p;

Menu = require('./menu');

TaskList = require('./task-list');

TaskStore = require('../stores/TaskStore');

TagStore = require('../stores/TagStore');

StoreWatchMixin = require('../mixins/store_watch_mixin');

module.exports = React.createClass({
  displayName: 'Application',
  mixins: [StoreWatchMixin([TagStore, TaskStore])],
  getStateFromStores: function() {
    var selectedTags, tasks;
    selectedTags = TagStore.getSelected();
    tasks = TaskStore.getByTags(selectedTags);
    return {
      tasks: tasks,
      selectedTags: selectedTags,
      tagTree: TagStore.getTree(),
      sortCriterion: TagStore.getSortCriterion(),
      isArchivedMode: TaskStore.isArchivedMode(),
      untaggedTasks: TaskStore.getUntagged(),
      numTasks: TaskStore.getNumTasks(),
      numArchivedTasks: TaskStore.getNumArchivedTasks(),
      searchQuery: TaskStore.getSearchQuery(),
      tasksDone: tasks.filter(function(task) {
        return task.done;
      }),
      isReindexing: TaskStore.isReindexing()
    };
  },
  render: function() {
    return div(null, div({
      id: 'menu'
    }, Menu({
      selectedTags: this.state.selectedTags,
      tree: this.state.tagTree,
      sortCriterion: this.state.sortCriterion,
      isArchivedMode: this.state.isArchivedMode,
      untaggedTasks: this.state.untaggedTasks,
      numTasks: this.state.numTasks,
      numArchivedTasks: this.state.numArchivedTasks
    })), div({
      className: 'container'
    }, TaskList({
      selectedTags: this.state.selectedTags,
      tasks: this.state.tasks,
      isArchivedMode: this.state.isArchivedMode,
      searchQuery: this.state.searchQuery,
      tasksDone: this.state.tasksDone
    })), this.state.isReindexing ? (div({
      id: 'block'
    }), div({
      id: 'modal'
    }, p(null, t('reindexing message')))) : void 0);
  }
});
});

;require.register("components/breadcrumb-item", function(exports, require, module) {
var a, div, span, styler, _ref;

_ref = React.DOM, div = _ref.div, span = _ref.span, a = _ref.a;

styler = React.addons.classSet;

module.exports = React.createClass({
  displayName: 'BreadcrumbItem',
  render: function() {
    var classes, isTag, removeProperties, value, wrapperProperties, _ref1;
    isTag = this.props.type === 'tag';
    classes = styler({
      'breadcrumb-item': true,
      'excluded': (_ref1 = this.props.tag) != null ? _ref1.isExcluded : void 0,
      'notice-delete-action': this.state.removeHovered
    });
    wrapperProperties = {
      className: classes,
      onClick: this.props.toggleModeHandler,
      key: this.props.key
    };
    if (!isTag) {
      value = "\"" + this.props.value + "\"";
    } else {
      value = this.props.tag.value;
    }
    removeProperties = {
      onMouseOver: this.onMouseOver,
      onMouseOut: this.onMouseOut,
      onClick: (function(_this) {
        return function(event) {
          event.stopPropagation();
          return _this.props.removeHandler();
        };
      })(this)
    };
    return div(wrapperProperties, span(null, value), a(removeProperties, '×'));
  },
  onMouseOver: function() {
    return this.setState({
      removeHovered: true
    });
  },
  onMouseOut: function() {
    return this.setState({
      removeHovered: false
    });
  },
  getInitialState: function() {
    return {
      removeHovered: false
    };
  }
});
});

;require.register("components/breadcrumb", function(exports, require, module) {
var AdjustableInput, BreadcrumbItem, h1, input, span, _ref;

_ref = React.DOM, h1 = _ref.h1, span = _ref.span, input = _ref.input;

BreadcrumbItem = require('./breadcrumb-item');

AdjustableInput = require('./adjustable-input');

module.exports = React.createClass({
  displayName: 'Breadcrumb',
  render: function() {
    var title;
    title = this.getTitle();
    return h1({
      id: 'breadcrumb'
    }, title, this.props.selectedTags != null ? this.renderSelectedTags() : void 0, this.props.searchQuery != null ? this.renderSearchInput() : void 0, (this.props.selectedTags == null) || ((this.props.selectedTags != null) && !this.hasNoTagSelected()) ? AdjustableInput({
      className: 'add-tag',
      placeholder: t('search tag input'),
      onSubmitHandler: this.onSubmit
    }) : void 0);
  },
  renderSelectedTags: function() {
    return this.props.selectedTags.map((function(_this) {
      return function(tag, index) {
        return BreadcrumbItem({
          key: index,
          type: 'tag',
          tag: tag,
          removeHandler: _this.removeHandler.bind(_this, tag),
          toggleModeHandler: _this.toggleModeHandler.bind(_this, tag)
        });
      };
    })(this));
  },
  renderSearchInput: function() {
    var translationKey;
    translationKey = 'match criterion';
    if (this.hasNoTagSelected()) {
      translationKey = "" + translationKey + " no tag";
    } else {
      translationKey = "" + translationKey + " with tag";
    }
    return BreadcrumbItem({
      key: 'search-query',
      type: 'search',
      value: this.props.searchQuery,
      removeHandler: this.removeHandler
    });
  },
  removeHandler: function(tag) {
    var index, newTagsList, searchQuery, _ref1;
    newTagsList = (_ref1 = this.props.selectedTags) != null ? _ref1.slice(0) : void 0;
    if ((tag != null) && (newTagsList != null)) {
      index = newTagsList.indexOf(tag);
      newTagsList.splice(index, 1);
    } else {
      searchQuery = null;
    }
    return this.buildUrl(newTagsList, searchQuery);
  },
  toggleModeHandler: function(tag) {
    var index, newTagsList, _ref1;
    newTagsList = (_ref1 = this.props.selectedTags) != null ? _ref1.slice(0) : void 0;
    if (newTagsList != null) {
      index = this.props.selectedTags.indexOf(tag);
      newTagsList[index] = {
        value: tag.value,
        isExcluded: !tag.isExcluded
      };
    }
    return this.buildUrl(newTagsList, this.props.searchQuery);
  },
  onSubmit: function(newTagValue) {
    var newTagsList, searchQuery, _ref1;
    searchQuery = this.props.searchQuery;
    newTagsList = (_ref1 = this.props.selectedTags) != null ? _ref1.slice(0) : void 0;
    if (newTagValue.indexOf('#') === 0) {
      newTagValue = newTagValue.replace('#', '');
      if (newTagsList != null) {
        newTagsList.push({
          value: newTagValue,
          isExcluded: false
        });
      } else {
        newTagsList = [
          {
            value: newTagValue,
            isExcluded: false
          }
        ];
      }
    } else {
      searchQuery = newTagValue;
    }
    return this.buildUrl(newTagsList, searchQuery);
  },
  buildUrl: function(tagsList, searchQuery) {
    var formattedList, location, prefix, query;
    if (tagsList != null) {
      formattedList = tagsList.map(function(tag) {
        if (tag.isExcluded) {
          return "!" + tag.value;
        } else {
          return "" + tag.value;
        }
      });
      formattedList = formattedList.join('/');
    } else {
      formattedList = '';
    }
    query = "";
    if ((tagsList != null ? tagsList.length : void 0) > 0) {
      if (this.props.isArchivedMode) {
        prefix = 'archivedByTags';
      } else {
        prefix = 'todoByTags/';
      }
      if (searchQuery != null) {
        query = "/;search/" + searchQuery;
      }
    } else if (searchQuery != null) {
      prefix = 'search/';
      query = searchQuery;
    } else {
      if (this.props.isArchivedMode) {
        prefix = 'archived';
      } else {
        prefix = '#';
      }
    }
    location = "#" + prefix + formattedList + query;
    return window.router.navigate(location, true);
  },
  hasNoTagSelected: function() {
    var _ref1;
    return (this.props.selectedTags == null) || ((_ref1 = this.props.selectedTags) != null ? _ref1.length : void 0) === 0;
  },
  getInitialState: function() {
    return {
      inputContent: ''
    };
  },
  getTitle: function() {
    var option, title;
    if (this.props.selectedTags == null) {
      if (this.props.isArchivedMode) {
        title = t('all archived tasks');
      } else {
        title = t('all tasks');
      }
    } else if (this.hasNoTagSelected()) {
      title = t('untagged tasks');
    } else {
      option = {
        smart_count: this.props.selectedTags.length
      };
      if (this.props.isArchivedMode) {
        title = t('archived tasks of', option);
      } else {
        title = t('tasks of', option);
      }
    }
    return title;
  }
});
});

;require.register("components/menu-item", function(exports, require, module) {
var a, i, li, span, styler, ul, _ref;

_ref = React.DOM, li = _ref.li, a = _ref.a, i = _ref.i, span = _ref.span, ul = _ref.ul;

styler = React.addons.classSet;

module.exports = React.createClass({
  displayName: 'MenuItem',
  render: function() {
    var classNames, linkStyle;
    classNames = styler({
      'menu-tag': true,
      'active': this.props.isActive,
      'selected': this.props.isSelected,
      'magic': this.props.magic
    });
    linkStyle = {
      'padding-left': (this.props.depth + 1) * 20
    };
    return li({
      className: classNames
    }, a({
      href: this.props.url,
      title: this.props.label,
      style: linkStyle
    }, i({
      className: 'tag-icon'
    }), span(null, "" + this.props.label + " (" + this.props.count + ")")), this.props.getSubmenu(this.props.depth + 1));
  }
});
});

;require.register("components/menu", function(exports, require, module) {
var MenuItem, SortCriterions, TagActionCreator, a, classer, div, i, li, span, ul, _ref;

_ref = React.DOM, div = _ref.div, i = _ref.i, ul = _ref.ul, li = _ref.li, a = _ref.a, span = _ref.span;

MenuItem = require('./menu-item');

SortCriterions = require('../constants/AppConstants').SortCriterions;

TagActionCreator = require('../actions/TagActionCreator');

classer = React.addons.classSet;

module.exports = React.createClass({
  displayName: 'Menu',
  render: function() {
    var archivedMenu, menu, todoMenu;
    archivedMenu = {
      id: 'archived',
      link: '#archived',
      label: t('archived'),
      count: this.props.numArchivedTasks
    };
    todoMenu = {
      id: 'tobedone',
      link: '#',
      label: t('todo'),
      count: this.props.numTasks
    };
    if (this.props.isArchivedMode) {
      menu = [todoMenu, archivedMenu];
    } else {
      menu = [archivedMenu, todoMenu];
    }
    return div({
      id: 'menu'
    }, i({
      className: 'fa fa-arrow-left'
    }), ul(null, li({
      id: menu[0].id,
      className: 'first-level'
    }, a({
      href: menu[0].link
    }, "" + menu[0].label + " (" + menu[0].count + ")")), li({
      id: menu[1].id,
      className: 'first-level active'
    }, a({
      href: menu[1].link
    }, "" + menu[1].label + " (" + menu[1].count + ")"), this.getSortMenu(), this.getSubmenu(0))));
  },
  getSortMenu: function() {
    var alphaProperties, classes, countProperties;
    classes = classer({
      'selected-sort': this.props.sortCriterion === SortCriterions.COUNT
    });
    countProperties = {
      className: classes,
      title: 'brah',
      onClick: this.onSelectCriterion.bind(this, SortCriterions.COUNT)
    };
    classes = classer({
      'selected-sort': this.props.sortCriterion === SortCriterions.ALPHA
    });
    alphaProperties = {
      className: classes,
      onClick: this.onSelectCriterion.bind(this, SortCriterions.ALPHA)
    };
    return ul({
      className: 'sorts'
    }, li(alphaProperties, a({
      href: '#',
      title: t('sort numeric'),
      className: 'fa fa-sort-alpha-asc'
    }, ' ')), li(countProperties, a({
      href: '#',
      title: t('sort alpha'),
      className: 'fa fa-sort-numeric-desc'
    }, ' ')));
  },
  getSubmenu: function(depth) {
    var tags;
    tags = this.props.tree[depth];
    return ul({
      className: 'submenu'
    }, depth === 0 && this.props.untaggedTasks.length > 0 ? this.getUntaggedMenuItem() : void 0, tags.map((function(_this) {
      return function(tag) {
        return _this.getMenuItem(tag.value, tag.count, depth);
      };
    })(this)));
  },
  getMenuItem: function(label, count, depth) {
    var currentIndex, getSubmenuHandler, isActive, isLeaf, prefix, selectedTagNames, tagsInUrl, url, _ref1;
    selectedTagNames = (_ref1 = this.props.selectedTags) != null ? _ref1.map(function(tag) {
      return tag.value;
    }) : void 0;
    if ((selectedTagNames != null ? selectedTagNames[depth] : void 0) === label) {
      getSubmenuHandler = this.getSubmenu;
    } else {
      getSubmenuHandler = function() {};
    }
    currentIndex = selectedTagNames != null ? selectedTagNames.indexOf(label) : void 0;
    isActive = currentIndex === depth;
    isLeaf = depth + 1 === (selectedTagNames != null ? selectedTagNames.length : void 0);
    tagsInUrl = (selectedTagNames != null ? selectedTagNames.slice(0, depth) : void 0) || [];
    if ((!_.contains(tagsInUrl, label) || (selectedTagNames != null ? selectedTagNames.length : void 0) > depth + 1) && (!(currentIndex + 1 === (selectedTagNames != null ? selectedTagNames.length : void 0) && depth === currentIndex))) {
      tagsInUrl.push(label);
    }
    if (this.props.isArchivedMode) {
      if (tagsInUrl.length > 0) {
        prefix = 'archivedByTags';
      } else {
        prefix = 'archived';
      }
    } else {
      if (tagsInUrl.length > 0) {
        prefix = 'todoByTags';
      } else {
        prefix = '';
      }
    }
    url = "#" + prefix;
    if (tagsInUrl.length > 0) {
      url = "#" + prefix + "/" + (tagsInUrl.join('/'));
    }
    return MenuItem({
      key: "" + label + "-" + depth,
      label: label,
      count: count,
      depth: depth,
      isActive: isActive,
      isSelected: isActive && isLeaf,
      getSubmenu: getSubmenuHandler,
      url: url
    });
  },
  onSelectCriterion: function(criterion) {
    event.preventDefault();
    return TagActionCreator.selectSortCriterion(criterion);
  },
  getUntaggedMenuItem: function() {
    var isActive, url, _ref1;
    isActive = ((_ref1 = this.props.selectedTags) != null ? _ref1.length : void 0) === 0;
    if (this.props.isArchivedMode) {
      if (isActive) {
        url = '#archived';
      } else {
        url = '#archivedByTags/';
      }
    } else {
      if (isActive) {
        url = '#';
      } else {
        url = '#todoByTags/';
      }
    }
    return MenuItem({
      key: "untagged",
      label: t('untagged'),
      count: this.props.untaggedTasks.length,
      depth: 0,
      isActive: isActive,
      isSelected: isActive,
      getSubmenu: function() {},
      url: url,
      magic: true
    });
  }
});
});

;require.register("components/task-list", function(exports, require, module) {
var Breadcrumb, Task, TaskActionCreator, TaskUtils, button, classer, div, h1, i, li, p, ul, _ref;

_ref = React.DOM, div = _ref.div, ul = _ref.ul, li = _ref.li, i = _ref.i, h1 = _ref.h1, p = _ref.p, button = _ref.button;

TaskActionCreator = require('../actions/TaskActionCreator');

TaskUtils = require('../utils/TaskUtil');

Breadcrumb = require('./breadcrumb');

Task = require('./task');

classer = React.addons.classSet;

module.exports = React.createClass({
  displayName: 'TaskList',
  render: function() {
    return div(null, i({
      className: 'fa fa-bars'
    }), Breadcrumb({
      selectedTags: this.props.selectedTags,
      searchQuery: this.props.searchQuery,
      isArchivedMode: this.props.isArchivedMode
    }), !this.props.isArchivedMode ? this.getActionsBar() : void 0, !this.props.isArchivedMode ? this.getRenderTask({
      id: 'new-task',
      key: "new-task",
      index: 0,
      placeholder: this.generatePlaceholder(),
      defaultValue: this.generateDefaultValue(),
      isFocus: this.state.focusIndex === 0
    }) : void 0, ul({
      id: 'task-list'
    }, this.props.tasks.map((function(_this) {
      return function(task, index) {
        index = index + 1;
        return _this.getRenderTask({
          key: "task-c" + task.cid,
          index: index,
          task: task,
          defaultValue: _this.generateDefaultValue(),
          isFocus: index === _this.state.focusIndex,
          isArchivedMode: _this.props.isArchivedMode
        });
      };
    })(this))));
  },
  getRenderTask: function(options) {
    var currentTask, noop;
    currentTask = options.task || null;
    options.newTaskHandler = this.newTaskHandler.bind(this, currentTask);
    options.moveFocusUpHandler = this.moveFocusUpHandler.bind(this, currentTask);
    options.moveFocusDownHandler = this.moveFocusDownHandler.bind(this, currentTask);
    options.setFocusHandler = this.setFocusHandler;
    if (currentTask != null) {
      options.removeHandler = this.removeTaskHandler.bind(this, currentTask);
      options.saveHandler = this.saveTaskHandler.bind(this, currentTask);
      options.moveUpHandler = this.moveTaskUpHandler.bind(this, currentTask);
      options.moveDownHandler = this.moveTaskDownHandler.bind(this, currentTask);
      options.toggleStateHandler = this.toggleStateHandler.bind(this, currentTask);
      options.restoreTaskHandler = this.restoreTaskHandler.bind(this, currentTask);
    } else {
      noop = function() {};
      options.removeHandler = noop;
      options.saveHandler = noop;
      options.moveUpHandler = noop;
      options.moveDownHandler = noop;
      options.toggleStateHandler = noop;
      options.restoreTaskHandler = noop;
    }
    return Task(options);
  },
  getActionsBar: function() {
    var buttonProperties, styles;
    styles = classer({
      button: 'true',
      disable: this.props.tasksDone.length === 0
    });
    buttonProperties = {
      id: 'archive-button',
      className: styles,
      onClick: this.archiveHandler
    };
    return p({
      id: 'actions'
    }, t('actions headline'), button(buttonProperties, t('archive button')));
  },
  newTaskHandler: function(previousTask, content) {
    if (content == null) {
      content = '';
    }
    if (content.length === 0) {
      content = this.generateDefaultValue();
    }
    return TaskActionCreator.createTask(content, previousTask);
  },
  removeTaskHandler: function(task) {
    if (this.state.focusIndex !== 1 || (this.props.tasks.length - 1) === 0) {
      this.moveFocusUpHandler();
    }
    return TaskActionCreator.removeTask(task);
  },
  saveTaskHandler: function(task, newContent) {
    return TaskActionCreator.editTask(task, newContent);
  },
  moveTaskUpHandler: function(task) {
    TaskActionCreator.moveUp(task);
    if (this.state.focusIndex !== 1) {
      return this.moveFocusUpHandler();
    }
  },
  moveTaskDownHandler: function(task) {
    TaskActionCreator.moveDown(task);
    return this.moveFocusDownHandler();
  },
  toggleStateHandler: function(task, isDone) {
    return TaskActionCreator.toggleState(task, isDone);
  },
  moveFocusUpHandler: function() {
    var newIndex;
    if (this.state.focusIndex > 0) {
      newIndex = this.state.focusIndex - 1;
    } else {
      newIndex = 0;
    }
    return this.setState({
      focusIndex: newIndex
    });
  },
  moveFocusDownHandler: function() {
    var listLength, newIndex;
    listLength = this.props.tasks.length;
    if (this.state.focusIndex < listLength) {
      newIndex = this.state.focusIndex + 1;
    } else {
      newIndex = listLength;
    }
    return this.setState({
      focusIndex: newIndex
    });
  },
  setFocusHandler: function(index) {
    var newIndex;
    if ((index != null) && index >= 0) {
      newIndex = index;
    } else {
      newIndex = -1;
    }
    return this.setState({
      focusIndex: newIndex
    });
  },
  archiveHandler: function() {
    return TaskActionCreator.archiveTasks(this.props.tasksDone);
  },
  restoreTaskHandler: function(task) {
    return TaskActionCreator.restoreTask(task);
  },
  getInitialState: function() {
    return {
      focusIndex: 0
    };
  },
  generatePlaceholder: function() {
    var tagsList;
    tagsList = TaskUtils.buildTagsList(this.props.selectedTags, {
      tagPrefix: '#',
      regularSeparator: ', ',
      lastSeparator: " " + (t('and')) + " "
    });
    if (tagsList.length > 0) {
      return t('form headline tags', {
        tagsList: tagsList
      });
    } else {
      return t('form headline');
    }
  },
  generateDefaultValue: function() {
    var tagsList;
    tagsList = TaskUtils.buildTagsList(this.props.selectedTags, {
      tagPrefix: '#'
    });
    if (tagsList !== "") {
      tagsList = "" + tagsList + " ";
    }
    return tagsList;
  }
});
});

;require.register("components/task", function(exports, require, module) {
var KeyboardKeys, Options, button, classer, div, input, p, _ref, _ref1,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ref = React.DOM, div = _ref.div, button = _ref.button, input = _ref.input, p = _ref.p;

_ref1 = require('../constants/AppConstants'), KeyboardKeys = _ref1.KeyboardKeys, Options = _ref1.Options;

classer = React.addons.classSet;

module.exports = React.createClass({
  displayName: 'Task',
  interval: null,
  render: function() {
    var buttonProperties, buttonText, completionDate, formattedDate, inputProperties, wrapperClasses, _ref2, _ref3;
    buttonText = this.getButtonText();
    buttonProperties = {
      className: classer({
        'toggle-state': true,
        'button': true,
        'disabled': !this.props.task && this.state.inputValue.length === 0
      }),
      title: buttonText,
      onMouseOver: this.onMouseOver,
      onMouseOut: this.onMouseOut,
      onClick: this.onClick
    };
    inputProperties = {
      tabIndex: this.props.index + 1,
      ref: 'task-content',
      placeholder: this.props.placeholder || '',
      value: this.state.inputValue,
      onChange: this.onChange,
      onKeyUp: this.onKeyUp,
      onKeyDown: this.onKeyDown,
      onFocus: this.onFocus,
      onBlur: this.onBlur
    };
    wrapperClasses = classer({
      'task': true,
      'done': (_ref2 = this.props.task) != null ? _ref2.done : void 0,
      'new-task': this.isNewTaskForm(),
      'is-creating': ((_ref3 = this.props.task) != null ? _ref3.id : void 0) == null
    });
    return div({
      className: wrapperClasses
    }, div({
      className: 'task-container'
    }, button(buttonProperties, buttonText), div({
      className: 'todo-field'
    }, div({
      className: 'task-input-wrapper'
    }, input(inputProperties)))), this.props.isArchivedMode ? (completionDate = Date.create(this.props.task.completionDate), formattedDate = completionDate.format(t('archived date format')), div({
      className: 'todo-completionDate'
    }, p(null, "" + (t('completed headline')) + " " + formattedDate))) : void 0);
  },
  getButtonText: function() {
    var buttonText, isArchived, isDone;
    if (this.props.task != null) {
      isDone = this.props.task.done;
      isArchived = this.props.task.isArchived;
      if (this.state.buttonHover && isArchived) {
        buttonText = t('restore button?');
      } else if (this.state.buttonHover && isDone) {
        buttonText = t('done button?');
      } else if (this.state.buttonHover && !isDone) {
        buttonText = t('todo button?');
      } else if (!this.state.buttonHover && isDone) {
        buttonText = t('done button');
      } else if (!this.state.buttonHover && !isDone) {
        buttonText = t('todo button');
      }
    } else {
      buttonText = t('new button');
    }
    return buttonText;
  },
  componentDidMount: function() {
    return this.componentDidUpdate();
  },
  componentDidUpdate: function() {
    var index, node;
    if (this.props.isFocus) {
      if ((this.props.task != null) && (this.interval == null)) {
        this.startPeriodocalSave();
      }
      if (this.state.selectContent) {
        node = this.refs['task-content'].getDOMNode();
        $(node).focus();
        index = node.value.length;
        node.setSelectionRange(0, index);
        return this.setState({
          selectContent: false
        });
      }
    }
  },
  getInitialState: function() {
    var _ref2;
    return {
      buttonHover: false,
      inputValue: ((_ref2 = this.props.task) != null ? _ref2.description : void 0) || '',
      selectContent: true
    };
  },
  onMouseOver: function() {
    return this.setState({
      buttonHover: true
    });
  },
  onMouseOut: function() {
    return this.setState({
      buttonHover: false
    });
  },
  onChange: function() {
    var node;
    node = this.refs['task-content'].getDOMNode();
    return this.setState({
      inputValue: node.value
    });
  },
  onKeyDown: function(event) {
    var authorizedComboKeys, comboKeyPressed, ctrlPressed, key, neutralKeys, node;
    node = this.refs['task-content'].getDOMNode();
    key = event.keyCode || event.charCode;
    ctrlPressed = event.controlKey || event.metaKey;
    comboKeyPressed = event.metaKey || event.controlKey || event.altKey;
    neutralKeys = [KeyboardKeys.BACKSPACE, KeyboardKeys.SPACE, KeyboardKeys.TAB, KeyboardKeys.ENTER, KeyboardKeys.ARROW_TOP, KeyboardKeys.ARROW_DOWN, KeyboardKeys.ARROW_LEFT, KeyboardKeys.ARROW_RIGHT];
    authorizedComboKeys = [KeyboardKeys.OSX_SHARP, KeyboardKeys.V];
    if (this.isNewTaskForm() && node.value.length === 0 && __indexOf.call(neutralKeys, key) < 0 && (!comboKeyPressed || __indexOf.call(authorizedComboKeys, key) >= 0)) {
      return this.setState({
        inputValue: this.props.defaultValue
      });
    } else if (node.value.length === 0 && key === KeyboardKeys.BACKSPACE) {
      event.preventDefault();
      return this.props.removeHandler();
    } else if (key === KeyboardKeys.ARROW_TOP && ctrlPressed) {
      return this.props.moveUpHandler();
    } else if (key === KeyboardKeys.ARROW_DOWN && ctrlPressed) {
      return this.props.moveDownHandler();
    }
  },
  onKeyUp: function(event) {
    var key;
    key = event.keyCode || event.charCode;
    if (key === KeyboardKeys.ENTER) {
      if (!this.props.isArchivedMode) {
        return this.createNewTask();
      }
    } else if (key === KeyboardKeys.ARROW_TOP) {
      return this.props.moveFocusUpHandler();
    } else if (key === KeyboardKeys.ARROW_DOWN) {
      return this.props.moveFocusDownHandler();
    }
  },
  onFocus: function() {
    if (!this.props.isFocus) {
      this.props.setFocusHandler(this.props.index || 0);
    }
    return this.startPeriodocalSave();
  },
  onBlur: function() {
    if (this.props.isFocus) {
      this.props.setFocusHandler(null);
    }
    this.setState({
      selectContent: true
    });
    this.stopPeriodicalSave();
    return this.saveDescription();
  },
  onClick: function() {
    if (this.props.task != null) {
      if (this.props.task.isArchived) {
        return this.props.restoreTaskHandler();
      } else {
        return this.props.toggleStateHandler(!this.props.task.done);
      }
    } else {
      return this.createNewTask();
    }
  },
  createNewTask: function() {
    var content;
    content = this.props.task != null ? null : this.state.inputValue;
    this.props.newTaskHandler(content);
    if (this.props.task == null) {
      this.setState({
        inputValue: ""
      });
    }
    if (this.props.task != null) {
      return this.props.setFocusHandler(this.props.index + 1);
    }
  },
  startPeriodocalSave: function() {
    if (this.interlval == null) {
      return this.interval = setInterval((function(_this) {
        return function() {
          return _this.saveDescription();
        };
      })(this), Options.SAVE_INTERVAL_TIME);
    }
  },
  saveDescription: function() {
    var node, ref, _ref2;
    ref = this.refs['task-content'];
    if (ref != null) {
      node = ref.getDOMNode();
      if (node.value !== ((_ref2 = this.props.task) != null ? _ref2.description : void 0)) {
        return this.props.saveHandler(node.value);
      }
    }
  },
  stopPeriodicalSave: function() {
    clearInterval(this.interval);
    return this.interval = null;
  },
  componentWillUnmount: function() {
    return this.stopPeriodicalSave();
  },
  isNewTaskForm: function() {
    return this.props.placeholder != null;
  }
});
});

;require.register("constants/AppConstants", function(exports, require, module) {
module.exports = {
  ActionTypes: {
    'SELECT_TAGS': 'SELECT_TAGS',
    'CREATE_TASK': 'CREATE_TASK',
    'EDIT_TASK': 'EDIT_TASK',
    'REMOVE_TASK': 'REMOVE_TASK',
    'REORDER_TASK': 'REORDER_TASK',
    'SELECT_SORT_CRITERION': 'SELECT_SORT_CRITERION',
    'SET_ARCHIVED_MODE': 'SET_ARCHIVED_MODE',
    'SET_SEARCH_QUERY': 'SET_SEARCH_QUERY',
    'ARCHIVE_TASK': 'ARCHIVE_TASK',
    'RESTORE_TASK': 'RESTORE_TASK',
    'SET_REINDEX_STATE': 'SET_REINDEX_STATE'
  },
  KeyboardKeys: {
    'ENTER': 13,
    'BACKSPACE': 8,
    'TAB': 9,
    'SPACE': 32,
    'ARROW_LEFT': 37,
    'ARROW_TOP': 38,
    'ARROW_RIGHT': 39,
    'ARROW_DOWN': 40,
    'V': 86,
    'OSX_SHARP': 220
  },
  SortCriterions: {
    'COUNT': 'count',
    'ALPHA': 'alpha'
  },
  PayloadSources: {
    'VIEW_ACTION': 'VIEW_ACTION',
    'SERVER_ACTION': 'SERVER_ACTION'
  },
  Options: {
    'SAVE_INTERVAL_TIME': 5000,
    'MIN_STEP': Math.pow(10, 4)
  }
};
});

;require.register("initialize", function(exports, require, module) {
var app;

app = require('application');

$(function() {
  $.fn.spin = function(opts, color) {
    var presets;
    presets = {
      tiny: {
        lines: 8,
        length: 2,
        width: 2,
        radius: 3
      },
      small: {
        lines: 8,
        length: 1,
        width: 2,
        radius: 4
      },
      medium: {
        lines: 10,
        length: 4,
        width: 3,
        radius: 6
      },
      large: {
        lines: 10,
        length: 8,
        width: 4,
        radius: 8
      },
      extralarge: {
        lines: 8,
        length: 3,
        width: 10,
        radius: 20,
        top: 30,
        left: 50
      }
    };
    if (typeof Spinner !== "undefined" && Spinner !== null) {
      return this.each(function() {
        var $this, spinner;
        $this = $(this);
        spinner = $this.data("spinner");
        if (spinner != null) {
          spinner.stop();
          return $this.data("spinner", null);
        } else if (opts !== false) {
          if (typeof opts === "string") {
            if (opts in presets) {
              opts = presets[opts];
            } else {
              opts = {};
            }
            if (color) {
              opts.color = color;
            }
          }
          spinner = new Spinner(opts);
          spinner.spin(this);
          return $this.data("spinner", spinner);
        }
      });
    }
  };
  return app.initialize();
});
});

;require.register("libs/flux/dispatcher/Dispatcher", function(exports, require, module) {

/*

    -- Coffee port of Facebook's flux dispatcher. It was in ES6 and I haven't been
    successful in adding a transpiler. --

    Copyright (c) 2014, Facebook, Inc.
    All rights reserved.

    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree. An additional grant
    of patent rights can be found in the PATENTS file in the same directory.
 */
var Dispatcher, invariant, _lastID, _prefix;

invariant = require('../invariant');

_lastID = 1;

_prefix = 'ID_';

module.exports = Dispatcher = Dispatcher = (function() {
  function Dispatcher() {
    this._callbacks = {};
    this._isPending = {};
    this._isHandled = {};
    this._isDispatching = false;
    this._pendingPayload = null;
  }


  /*
      Registers a callback to be invoked with every dispatched payload. Returns
      a token that can be used with `waitFor()`.
  
      @param {function} callback
      @return {string}
   */

  Dispatcher.prototype.register = function(callback) {
    var id;
    id = _prefix + _lastID++;
    this._callbacks[id] = callback;
    return id;
  };


  /*
      Removes a callback based on its token.
  
      @param {string} id
   */

  Dispatcher.prototype.unregister = function(id) {
    invariant(this._callbacks[id], 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id);
    return delete this._callbacks[id];
  };


  /*
      Waits for the callbacks specified to be invoked before continuing execution
      of the current callback. This method should only be used by a callback in
      response to a dispatched payload.
  
      @param {array<string>} ids
   */

  Dispatcher.prototype.waitFor = function(ids) {
    var id, ii, _i, _ref, _results;
    invariant(this._isDispatching, 'Dispatcher.waitFor(...): Must be invoked while dispatching.');
    _results = [];
    for (ii = _i = 0, _ref = ids.length - 1; _i <= _ref; ii = _i += 1) {
      id = ids[ii];
      if (this._isPending[id]) {
        invariant(this._isHandled[id], 'Dispatcher.waitFor(...): Circular dependency detected while waiting for `%s`.', id);
        continue;
      }
      invariant(this._callbacks[id], 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id);
      _results.push(this._invokeCallback(id));
    }
    return _results;
  };


  /*
      Dispatches a payload to all registered callbacks.
  
      @param {object} payload
   */

  Dispatcher.prototype.dispatch = function(payload) {
    var id, _results;
    invariant(!this._isDispatching, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.');
    this._startDispatching(payload);
    try {
      _results = [];
      for (id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        _results.push(this._invokeCallback(id));
      }
      return _results;
    } finally {
      this._stopDispatching();
    }
  };


  /*
      Is this Dispatcher currently dispatching.
  
      @return {boolean}
   */

  Dispatcher.prototype.isDispatching = function() {
    return this._isDispatching;
  };


  /*
      Call the callback stored with the given id. Also do some internal
      bookkeeping.
  
      @param {string} id
      @internal
   */

  Dispatcher.prototype._invokeCallback = function(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    return this._isHandled[id] = true;
  };


  /*
      Set up bookkeeping needed when dispatching.
  
      @param {object} payload
      @internal
   */

  Dispatcher.prototype._startDispatching = function(payload) {
    var id;
    for (id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    return this._isDispatching = true;
  };


  /*
      Clear bookkeeping used for dispatching.
  
      @internal
   */

  Dispatcher.prototype._stopDispatching = function() {
    this._pendingPayload = null;
    return this._isDispatching = false;
  };

  return Dispatcher;

})();
});

;require.register("libs/flux/invariant", function(exports, require, module) {
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (__DEV__) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;
});

;require.register("libs/flux/store/Store", function(exports, require, module) {
var AppDispatcher, Store,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppDispatcher = require('../../../AppDispatcher');

module.exports = Store = (function(_super) {
  var _addHandlers, _handlers, _nextUniqID, _processBinding;

  __extends(Store, _super);

  Store.prototype.uniqID = null;

  _nextUniqID = 0;

  _handlers = {};

  _addHandlers = function(type, callback) {
    if (_handlers[this.uniqID] == null) {
      _handlers[this.uniqID] = {};
    }
    return _handlers[this.uniqID][type] = callback;
  };

  _processBinding = function() {
    return this.dispatchToken = AppDispatcher.register((function(_this) {
      return function(payload) {
        var callback, type, value, _ref, _ref1;
        _ref = payload.action, type = _ref.type, value = _ref.value;
        if ((callback = (_ref1 = _handlers[_this.uniqID]) != null ? _ref1[type] : void 0) != null) {
          return callback.call(_this, value);
        }
      };
    })(this));
  };

  function Store() {
    Store.__super__.constructor.call(this);
    this.uniqID = _nextUniqID++;
    this.__bindHandlers(_addHandlers.bind(this));
    _processBinding.call(this);
  }

  Store.prototype.__bindHandlers = function(handle) {
    if (__DEV__) {
      throw new Error("The store " + this.constructor.name + " must define a `__bindHandlers` method");
    }
  };

  return Store;

})(EventEmitter);
});

;require.register("locales/en", function(exports, require, module) {
module.exports = {
  "todo": "To-do",
  "archived": "Archived",
  "untagged": "untagged",
  "all tasks": "All tasks",
  "all archived tasks": "All archived tasks",
  "untagged tasks": "Untagged tasks",
  "tasks of": "Tasks related to",
  "archived tasks of": "Archived tasks related to",
  "and": "and",
  "archived date format": "{yyyy}/{MM}{dd} at {HH}:{mm}",
  "actions headline": "Actions",
  "completed headline": "Completed on",
  "restore button": "Restore",
  "restore button?": "Restore?",
  "done button": "Done",
  "done button?": "Done?",
  "todo button": "Todo",
  "todo button?": "Todo?",
  "new button": "New",
  "archive button": "Archive all done tasks",
  "form headline tags": "What's next about %{tagsList}?",
  "form headline": "What's next?",
  "reindexing message": "Server is reindexing all the tasks, please wait a little...",
  "search tag input": "search...",
  "match criterion no tag": "of criterion",
  "match criterion with tag": "and of criterion",
  "sort alpha": "Sort by tag name",
  "sort numeric": "Sort by number of tasks"
};
});

;require.register("locales/fr", function(exports, require, module) {
module.exports = {
  "todo": "A faire",
  "archived": "Archivées",
  "untagged": "sans étiquette",
  "all tasks": "Toutes les tâches",
  "all archived tasks": "Toutes les tâches archivées",
  "untagged tasks": "Tâches sans étiquettes",
  "tasks of": "Tâches de",
  "archived tasks of": "Tâches archivées de",
  "and": "et",
  "archived date format": "{dd}/{MM}/{yyyy} à {HH}h{mm}",
  "actions headline": "Actions",
  "completed headline": "Complétée le",
  "restore button": "Restaurer",
  "restore button?": "Restaurer ?",
  "done button": "Fait",
  "done button?": "Fait ?",
  "todo button": "A faire",
  "todo button?": "A faire ?",
  "new button": "Ajouter",
  "archive button": "Archiver toutes les tâches faites",
  "form headline tags": "Que devez-vous faire à propos de %{tagsList} ?",
  "form headline": "Que devez-vous faire ?",
  "reindexing message": "Le serveur est en train de ré-indexer les tâches, merci de patienter...",
  "search tag input": "recherche...",
  "match criterion no tag": "correspondant au critère",
  "match criterion with tag": "et au critère",
  "sort alpha": "Tri par étiquette",
  "sort numeric": "Tri par nombre de tâches"
};
});

;require.register("mixins/store_watch_mixin", function(exports, require, module) {
var StoreWatchMixin;

module.exports = StoreWatchMixin = function(stores) {
  return {
    componentDidMount: function() {
      return stores.forEach((function(_this) {
        return function(store) {
          return store.on('change', _this._setStateFromStores);
        };
      })(this));
    },
    componentWillUnmount: function() {
      return stores.forEach((function(_this) {
        return function(store) {
          return store.removeListener('change', _this._setStateFromStores);
        };
      })(this));
    },
    getInitialState: function() {
      return this.getStateFromStores();
    },
    _setStateFromStores: function() {
      return this.setState(this.getStateFromStores());
    }
  };
};
});

;require.register("router", function(exports, require, module) {
var App, Router, TagActionCreator, TaskActionCreator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

window.__DEV__ = true;

TaskActionCreator = require('./actions/TaskActionCreator');

TagActionCreator = require('./actions/TagActionCreator');

TaskActionCreator = require('./actions/TaskActionCreator');

App = require('./components/application');

Router = (function(_super) {
  __extends(Router, _super);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    '': 'main',
    'archived': 'archived',
    'search/:query': 'mainSearch',
    'todoByTags/*tags/;search/:query': 'todoByTagsWithSearch',
    'todoByTags/;search/:query': 'todoByTagsWithSearch',
    'todoByTags/*tags': 'todoByTags',
    'archivedByTags/*tags': 'archivedByTags'
  };

  Router.prototype.main = function(followUp) {
    if (followUp == null) {
      followUp = false;
    }
    TaskActionCreator.setArchivedMode(false);
    TagActionCreator.selectTags(null);
    return React.renderComponent(App(), $('body')[0]);
  };

  Router.prototype.mainSearch = function(query) {
    return TaskActionCreator.setSearchQuery(query);
  };

  Router.prototype.archived = function() {
    TaskActionCreator.setArchivedMode(true);
    TagActionCreator.selectTags(null);
    return React.renderComponent(App(), $('body')[0]);
  };

  Router.prototype.byTags = function(viewType, listView, tags, searchQuery, isArchived) {
    if (tags != null) {
      tags = tags.split('/');
      if (tags[tags.length - 1].length === 0) {
        tags.splice(tags.length - 1);
      }
    } else {
      tags = [];
    }
    TaskActionCreator.setArchivedMode(isArchived);
    TagActionCreator.selectTags(tags);
    TaskActionCreator.setSearchQuery(searchQuery);
    return React.renderComponent(App(), $('body')[0]);
  };

  Router.prototype.todoByTags = function(tags) {
    return this.byTags('#tobedone', this.taskList, tags, null, false);
  };

  Router.prototype.todoByTagsWithSearch = function(tags, query) {
    if (query == null) {
      query = tags;
      tags = null;
    }
    return this.byTags('#tobedone', this.taskList, tags, query);
  };

  Router.prototype.archivedByTags = function(tags) {
    return this.byTags('#archived', this.archivedTaskList, tags, null, true);
  };

  return Router;

})(Backbone.Router);

module.exports = new Router();
});

;require.register("stores/TagStore", function(exports, require, module) {
var ActionTypes, SortCriterions, Store, TagStore, TaskStore, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Store = require('../libs/flux/store/Store');

TaskStore = require('./TaskStore');

_ref = require('../constants/AppConstants'), ActionTypes = _ref.ActionTypes, SortCriterions = _ref.SortCriterions;

TagStore = (function(_super) {

  /*
      Initialization.
      Defines private variables here.
   */
  var fromLocalStorage, _selectedTags, _sortCriterion;

  __extends(TagStore, _super);

  function TagStore() {
    return TagStore.__super__.constructor.apply(this, arguments);
  }

  _selectedTags = null;

  fromLocalStorage = localStorage.getItem('sort-criterion');

  _sortCriterion = fromLocalStorage || SortCriterions.COUNT;

  TagStore.prototype.__bindHandlers = function(handle) {
    handle(ActionTypes.SELECT_TAGS, function(tags) {
      _selectedTags = tags != null ? tags.map(function(tag) {
        var isExcluded, value;
        isExcluded = tag.indexOf('!') !== -1;
        value = tag.replace('!', '');
        return {
          value: value,
          isExcluded: isExcluded
        };
      }) : void 0;
      return this.emit('change');
    });
    return handle(ActionTypes.SELECT_SORT_CRITERION, function(criterion) {
      _sortCriterion = criterion;
      return this.emit('change');
    });
  };

  TagStore.prototype.getSelected = function() {
    return _selectedTags;
  };

  TagStore.prototype.getSelectedNames = function() {
    return _selectedTags != null ? _selectedTags.map(function(tag) {
      return tag.value;
    }) : void 0;
  };

  TagStore.prototype.getSortCriterion = function() {
    return _sortCriterion;
  };

  TagStore.prototype.getTree = function() {
    var aTree, branch, buildTree, count, depth, depths, factor, firstCriterion, maxDepth, secondCriterion, selectedTagNames, tag, tree, _i, _j, _len, _ref1, _ref2;
    selectedTagNames = this.getSelectedNames();
    maxDepth = (selectedTagNames != null ? selectedTagNames.length : void 0) || 0;
    tree = [];
    for (depth = _i = 0; _i <= maxDepth; depth = _i += 1) {
      tree.push({});
    }
    buildTree = function(depth, list, excludeList) {
      var uniqList;
      if (excludeList == null) {
        excludeList = [];
      }
      uniqList = _.uniq(list);
      return uniqList.forEach(function(tag) {
        var _base;
        if (__indexOf.call(excludeList, tag) < 0) {
          if ((_base = tree[depth])[tag] == null) {
            _base[tag] = 0;
          }
          return tree[depth][tag]++;
        }
      });
    };
    TaskStore.getAll().map(function(task) {
      return task.tags;
    }).forEach(function(tagsOfTask) {
      var intersection, processedSelection, _j, _results;
      buildTree(0, tagsOfTask);
      _results = [];
      for (depth = _j = 1; _j <= maxDepth; depth = _j += 1) {
        processedSelection = selectedTagNames != null ? selectedTagNames.slice(0, depth) : void 0;
        intersection = _.intersection(processedSelection, tagsOfTask);
        if (intersection.length === processedSelection.length) {
          _results.push(buildTree(depth, tagsOfTask, processedSelection));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
    aTree = [];
    if (_sortCriterion === 'count') {
      _ref1 = ['count', 'value', 1], firstCriterion = _ref1[0], secondCriterion = _ref1[1], factor = _ref1[2];
    } else if (_sortCriterion === 'alpha') {
      _ref2 = ['value', 'count', -1], firstCriterion = _ref2[0], secondCriterion = _ref2[1], factor = _ref2[2];
    }
    for (_j = 0, _len = tree.length; _j < _len; _j++) {
      branch = tree[_j];
      depths = [];
      for (tag in branch) {
        count = branch[tag];
        depths.push({
          value: tag,
          count: count
        });
      }
      depths.sort(function(a, b) {
        var aFirst, aSecond, bFirst, bSecond;
        aFirst = a[firstCriterion];
        bFirst = b[firstCriterion];
        if (aFirst > bFirst) {
          return -1 * factor;
        } else if (aFirst < bFirst) {
          return 1 * factor;
        } else {
          aSecond = a[secondCriterion];
          bSecond = b[secondCriterion];
          if (aSecond > bSecond) {
            return -1 * factor;
          } else if (aSecond < bSecond) {
            return 1 * factor;
          } else {
            return 0;
          }
        }
      });
      aTree.push(depths);
    }
    return aTree;
  };

  return TagStore;

})(Store);

module.exports = new TagStore();
});

;require.register("stores/TaskStore", function(exports, require, module) {
var ActionTypes, Store, TaskStore, TaskUtils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Store = require('../libs/flux/store/Store');

TaskUtils = require('../utils/TaskUtil');

ActionTypes = require('../constants/AppConstants').ActionTypes;

TaskStore = (function(_super) {

  /*
      Initialization.
      Defines private variables here.
   */
  var task, _archivedMode, _archivedTasks, _archivedTasksByCid, _cid, _getTaskLists, _i, _isReindexing, _j, _len, _len1, _searchQuery, _tasks, _tasksByCid;

  __extends(TaskStore, _super);

  function TaskStore() {
    return TaskStore.__super__.constructor.apply(this, arguments);
  }

  _cid = 0;

  _tasks = Immutable.Sequence(window.tasks).mapKeys(function(_, task) {
    return task.id;
  }).map(function(task) {
    return Immutable.fromJS(task);
  }).toOrderedMap();

  _archivedMode = false;

  _archivedTasks = window.archivedTasks;

  _tasks = window.tasks;

  _searchQuery = null;

  _isReindexing = false;

  _archivedTasks.sort(function(a, b) {
    if (a.completionDate > b.completionDate) {
      return 1;
    } else if (a.completionDate < b.completionDate) {
      return -1;
    } else {
      return 0;
    }
  });

  _tasks.sort(function(a, b) {
    if (a.order > b.order) {
      return 1;
    } else if (a.order < b.order) {
      return -1;
    } else {
      return 0;
    }
  });

  _tasksByCid = {};

  for (_i = 0, _len = _tasks.length; _i < _len; _i++) {
    task = _tasks[_i];
    task.cid = _cid++;
    _tasksByCid[task.cid] = task;
  }

  _archivedTasksByCid = {};

  for (_j = 0, _len1 = _archivedTasks.length; _j < _len1; _j++) {
    task = _archivedTasks[_j];
    task.cid = _cid++;
    _archivedTasksByCid[task.cid] = task;
  }

  _getTaskLists = function() {
    var tasksList, tasksListByCid;
    if (_archivedMode) {
      tasksList = _archivedTasks;
      tasksListByCid = _archivedTasksByCid;
    } else {
      tasksList = _tasks;
      tasksListByCid = _tasksByCid;
    }
    return {
      tasksList: tasksList,
      tasksListByCid: tasksListByCid
    };
  };

  TaskStore.prototype.__bindHandlers = function(handle) {
    handle(ActionTypes.CREATE_TASK, function(payload) {
      var nextIndex, rawTask;
      nextIndex = payload.nextIndex, rawTask = payload.rawTask;
      _tasks.splice(nextIndex, 0, rawTask);
      _tasksByCid[rawTask.cid] = rawTask;
      return this.emit('change');
    });
    handle(ActionTypes.REMOVE_TASK, function(task) {
      var index, tasksList, tasksListByCid, _ref;
      _ref = _getTaskLists(), tasksList = _ref.tasksList, tasksListByCid = _ref.tasksListByCid;
      index = tasksList.indexOf(task);
      tasksList.splice(index, 1);
      delete tasksListByCid[task.cid];
      return this.emit('change');
    });
    handle(ActionTypes.UPDATE_TASK, function(payload) {
      var changes, cid, field, tasksList, tasksListByCid, value, _ref;
      _ref = _getTaskLists(), tasksList = _ref.tasksList, tasksListByCid = _ref.tasksListByCid;
      cid = payload.cid, changes = payload.changes;
      task = tasksListByCid[cid];
      for (field in changes) {
        value = changes[field];
        task[field] = value;
      }
      return this.emit('change');
    });
    handle(ActionTypes.REORDER_TASK, function(payload) {
      var changedPiece, index, oldIndex, task1, task2, tasksList, tasksListByCid, _ref;
      _ref = _getTaskLists(), tasksList = _ref.tasksList, tasksListByCid = _ref.tasksListByCid;
      changedPiece = payload.changedPiece, index = payload.index, oldIndex = payload.oldIndex, task = payload.task;
      task1 = changedPiece[0], task2 = changedPiece[1];
      index = Math.max(index, 0);
      tasksList.splice(oldIndex, 1);
      tasksList.splice(index, 0, task);
      return this.emit('change');
    });
    handle(ActionTypes.SET_ARCHIVED_MODE, function(isArchived) {
      _archivedMode = isArchived;
      return this.emit('change');
    });
    handle(ActionTypes.SET_SEARCH_QUERY, function(searchQuery) {
      _searchQuery = searchQuery;
      return this.emit('change');
    });
    handle(ActionTypes.ARCHIVE_TASK, function(cid) {
      var index;
      task = _tasksByCid[cid];
      if (task != null) {
        index = _tasks.indexOf(task);
        delete _tasksByCid[cid];
        _tasks.splice(index, 1);
        task.isArchived = true;
        _archivedTasksByCid[cid] = task;
        index = _.sortedIndex(_archivedTasks, task, function(task) {
          return -(new Date(task.completionDate).getTime());
        });
        _archivedTasks.splice(index, 0, task);
        return this.emit('change');
      }
    });
    handle(ActionTypes.RESTORE_TASK, function(cid) {
      var index;
      task = _archivedTasksByCid[cid];
      if (task != null) {
        index = _archivedTasks.indexOf(task);
        delete _archivedTasksByCid[cid];
        _archivedTasks.splice(index, 1);
        task.isArchived = false;
        task.done = false;
        _tasksByCid[cid] = task;
        index = _.sortedIndex(_tasks, task, function(task) {
          return task.order;
        });
        _tasks.splice(index, 0, task);
        return this.emit('change');
      }
    });
    return handle(ActionTypes.SET_REINDEX_STATE, function(isReindexing) {
      _isReindexing = isReindexing;
      return this.emit('change');
    });
  };

  TaskStore.prototype.getAll = function() {
    var tasksList;
    tasksList = _getTaskLists().tasksList;
    return tasksList;
  };

  TaskStore.prototype.getUntagged = function() {
    var tasksList;
    tasksList = _getTaskLists().tasksList;
    return tasksList.filter(function(task) {
      return task.tags.length === 0;
    });
  };

  TaskStore.prototype.getByTags = function(tags) {
    var excludedTags, filteredTasksList, includedTags, mapValue, noInclusion, regex, tasksList;
    tasksList = _getTaskLists().tasksList;
    if (tags == null) {
      return tasksList;
    } else if (tags.length === 0) {
      return tasksList.filter(function(task) {
        return task.tags.length === 0;
      });
    } else {
      mapValue = function(tag) {
        return tag.value;
      };
      includedTags = tags.filter(function(tag) {
        return !tag.isExcluded;
      }).map(mapValue);
      noInclusion = includedTags.length === 0;
      excludedTags = tags.filter(function(tag) {
        return tag.isExcluded;
      }).map(mapValue);
      filteredTasksList = tasksList.filter(function(task) {
        return (TaskUtils.containsTags(task, includedTags) || noInclusion) && TaskUtils.doesntContainsTags(task, excludedTags);
      });
      if (_searchQuery != null) {
        regex = new RegExp(_searchQuery, 'i');
        filteredTasksList = filteredTasksList.filter(function(task) {
          return regex.test(task.description);
        });
      }
      return filteredTasksList;
    }
  };

  TaskStore.prototype.getNextCid = function() {
    return _cid++;
  };

  TaskStore.prototype.isArchivedMode = function() {
    return _archivedMode;
  };

  TaskStore.prototype.getNumTasks = function() {
    return _tasks.length;
  };

  TaskStore.prototype.getNumArchivedTasks = function() {
    return _archivedTasks.length;
  };

  TaskStore.prototype.getSearchQuery = function() {
    return _searchQuery;
  };

  TaskStore.prototype.isReindexing = function() {
    return _isReindexing;
  };

  return TaskStore;

})(Store);

module.exports = new TaskStore();
});

;require.register("utils/TaskUtil", function(exports, require, module) {
var regex;

regex = /(^|\s)#([\w\d\-_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)(?=\s|$)/g;

module.exports.containsTags = function(task, tags) {
  var lowerCasedTags;
  if (tags.length === 0) {
    return task.tags.length === 0;
  } else {
    lowerCasedTags = task.tags.map(function(tag) {
      return tag.toLowerCase();
    });
    return _.every(tags, _.partial(_.contains, lowerCasedTags));
  }
};

module.exports.doesntContainsTags = function(task, tags) {
  var lowerCasedTags;
  if (tags.length === 0) {
    return true;
  } else {
    lowerCasedTags = task.tags.map(function(tag) {
      return tag.toLowerCase();
    });
    return !_.some(tags, _.partial(_.contains, lowerCasedTags));
  }
};

module.exports.extractTags = function(desc) {
  var tags;
  tags = desc.match(regex);
  tags = _.map(tags, function(tag) {
    return tag.trim().replace('#', '');
  });
  tags = _.uniq(tags);
  return tags;
};

module.exports.getNewOrder = function(previousTask, nextTask) {
  var lowBoundary, order, step, topBoundary;
  topBoundary = nextTask != null ? nextTask.order : Number.MAX_VALUE;
  lowBoundary = previousTask != null ? previousTask.order : 0.0;
  step = (topBoundary - lowBoundary) / 2;
  order = lowBoundary + step;
  return {
    order: order,
    step: step
  };
};

module.exports.buildTagsList = function(tags, options) {
  var includedTags, lastSeparator, regularSeparator, tagPrefix, tagsList;
  if (options == null) {
    options = {};
  }
  tagPrefix = options.tagPrefix || '';
  regularSeparator = options.regularSeparator || ' ';
  lastSeparator = options.lastSeparator || ' ';
  if (tags == null) {
    return "";
  }
  tagsList = "";
  includedTags = tags.filter(function(tag) {
    return !tag.isExcluded;
  }).map(function(tag) {
    return tag.value;
  });
  includedTags.forEach(function(tag) {
    if (includedTags.indexOf(tag) === 0) {
      return tagsList = "" + tagPrefix + tag;
    } else if (includedTags.indexOf(tag) === (includedTags.length - 1)) {
      return tagsList = "" + tagsList + lastSeparator + tagPrefix + tag;
    } else {
      return tagsList = "" + tagsList + regularSeparator + tagPrefix + tag;
    }
  });
  return tagsList;
};
});

;require.register("utils/XHRUtils", function(exports, require, module) {
var request;

request = superagent;

module.exports = {
  create: function(rawTask, callback) {
    return request.post("tasks").send(rawTask).set('Accept', 'application/json').end(function(res) {
      if (res.ok) {
        return callback(null, res.body);
      } else {
        return callback("Something went wrong -- " + res.body);
      }
    });
  },
  update: function(taskID, attributes, callback) {
    return request.put("tasks/" + taskID).send(attributes).set('Accept', 'application/json').end(function(res) {
      if (res.ok) {
        return callback(null, res.body);
      } else {
        return callback("Something went wrong -- " + res.body);
      }
    });
  },
  remove: function(taskID, callback) {
    return request.del("tasks/" + taskID).set('Accept', 'application/json').end(function(res) {
      if (res.ok) {
        return callback(null);
      } else {
        return callback("Something went wrong -- " + res.body);
      }
    });
  },
  reindex: function(callback) {
    return request.post('tasks/reindex').end(function(res) {
      if (res.ok) {
        return callback(null, res.body);
      } else {
        return callback("Something went wrong -- " + res.body);
      }
    });
  }
};
});

;
//# sourceMappingURL=app.js.map