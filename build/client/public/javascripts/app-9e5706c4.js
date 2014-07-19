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
require.register("application", function(exports, require, module) {
module.exports = {
  initialize: function() {
    var Router, e, locales;
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
    Router = require('router');
    this.router = new Router();
    Backbone.history.start();
    if (typeof Object.freeze === 'function') {
      return Object.freeze(this);
    }
  }
};
});

;require.register("collections/archived_tasks", function(exports, require, module) {
var ArchivedTaskCollection, TaskCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TaskCollection = require('./tasks');

module.exports = ArchivedTaskCollection = (function(_super) {
  __extends(ArchivedTaskCollection, _super);

  function ArchivedTaskCollection() {
    return ArchivedTaskCollection.__super__.constructor.apply(this, arguments);
  }

  ArchivedTaskCollection.prototype.comparator = function(a, b) {
    if (a.get('completionDate') > b.get('completionDate')) {
      return -1;
    } else if (a.get('completionDate') === b.get('completionDate')) {
      return 0;
    } else {
      return 1;
    }
  };

  return ArchivedTaskCollection;

})(TaskCollection);
});

;require.register("collections/tags", function(exports, require, module) {
var TagsCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = TagsCollection = (function(_super) {
  __extends(TagsCollection, _super);

  function TagsCollection() {
    return TagsCollection.__super__.constructor.apply(this, arguments);
  }

  TagsCollection.prototype.comparator = function(a, b) {
    if (a.get('count') > b.get('count')) {
      return -1;
    } else if (a.get('count') === b.get('count')) {
      if (a.get('id') < b.get('id')) {
        return -1;
      } else if (a.get('id') > b.get('id')) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 1;
    }
  };

  TagsCollection.extractFromTasks = function(taskCollection, excludes, selectedTags) {
    var tagsList;
    if (excludes == null) {
      excludes = [];
    }
    if (selectedTags == null) {
      selectedTags = [];
    }
    tagsList = new TagsCollection();
    taskCollection.pluck('tags').forEach(function(tagsOfTask) {
      return tagsOfTask.forEach(function(tag) {
        var tagInfo;
        tag = tag.toLowerCase();
        if (!_.contains(excludes, tag)) {
          if (tagsList.get(tag) == null) {
            tagsList.add(new Backbone.Model({
              id: tag,
              count: 0,
              selectIndex: selectedTags.indexOf(tag)
            }));
          }
          tagInfo = tagsList.get(tag);
          return tagInfo.set('count', tagInfo.get('count') + 1);
        }
      });
    });
    tagsList.sort();
    return tagsList;
  };

  return TagsCollection;

})(Backbone.Collection);
});

;require.register("collections/tasks", function(exports, require, module) {
var TagsCollection, Task, TaskCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TagsCollection = require('./tags');

Task = require('../models/task');

module.exports = TaskCollection = (function(_super) {
  __extends(TaskCollection, _super);

  function TaskCollection() {
    return TaskCollection.__super__.constructor.apply(this, arguments);
  }

  TaskCollection.prototype.url = 'tasks';

  TaskCollection.prototype.model = Task;

  TaskCollection.prototype.comparator = function(a, b) {
    if (a.get('order') < b.get('order')) {
      return -1;
    } else if (a.get('order') === b.get('order')) {
      return 0;
    } else {
      return 1;
    }
  };

  TaskCollection.prototype.getNewOrder = function(prev, next) {
    var lowBoundary, order, step, topBoundary;
    topBoundary = next != null ? next.get('order') : Number.MAX_VALUE;
    lowBoundary = prev != null ? prev.get('order') : 0.0;
    step = (topBoundary - lowBoundary) / 2;
    order = lowBoundary + step;
    return {
      order: order,
      step: step
    };
  };

  TaskCollection.prototype.getAllTags = function() {
    return TagsCollection.extractFromTasks(this);
  };

  TaskCollection.prototype.getByTags = function(tags) {
    var excludedTags, includedTags;
    if (tags === void 0 || tags === null) {
      return this;
    }
    if (tags.length === 0) {
      return new BackboneProjections.Filtered(this, {
        filter: function(task) {
          return task.get('tags').length === 0;
        }
      });
    }
    includedTags = _.filter(tags, function(tag) {
      return tag.indexOf('!') !== 0;
    });
    excludedTags = _.filter(tags, function(tag) {
      return tag.indexOf('!') === 0;
    });
    excludedTags = _.map(excludedTags, function(tag) {
      return tag.substr(1);
    });
    return new BackboneProjections.Filtered(this, {
      filter: function(task) {
        return task.containsTags(includedTags) && task.doesntContainsTags(excludedTags);
      }
    });
  };

  TaskCollection.prototype.reindex = function() {
    this.trigger('reindexing');
    return $.ajax('tasks/reindex', {
      method: 'POST',
      success: (function(_this) {
        return function(data) {
          data.forEach(function(task) {
            return _this.get(task.id).set('order', task.order);
          });
          return _this.trigger('reindexed');
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return _this.trigger('reindexed', data);
        };
      })(this)
    });
  };

  return TaskCollection;

})(Backbone.Collection);
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

;require.register("lib/base_view", function(exports, require, module) {
var BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BaseView = (function(_super) {
  __extends(BaseView, _super);

  function BaseView() {
    return BaseView.__super__.constructor.apply(this, arguments);
  }

  BaseView.prototype.template = function() {};

  BaseView.prototype.initialize = function() {};

  BaseView.prototype.getRenderData = function() {
    var _ref;
    return {
      model: (_ref = this.model) != null ? _ref.toJSON() : void 0
    };
  };

  BaseView.prototype.render = function() {
    this.beforeRender();
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  };

  BaseView.prototype.beforeRender = function() {};

  BaseView.prototype.afterRender = function() {};

  BaseView.prototype.destroy = function() {
    this.undelegateEvents();
    this.$el.removeData().unbind();
    this.remove();
    return Backbone.View.prototype.remove.call(this);
  };

  return BaseView;

})(Backbone.View);
});

;require.register("lib/utils", function(exports, require, module) {
module.exports.buildTagsList = function(tags, options) {
  var lastSeparator, regularSeparator, tagPrefix, tagsList;
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
  tags.forEach(function(tag) {
    if (tags.indexOf(tag) === 0) {
      return tagsList = "" + tagPrefix + tag;
    } else if (tags.indexOf(tag) === (tags.length - 1)) {
      return tagsList = "" + tagsList + lastSeparator + tagPrefix + tag;
    } else {
      return tagsList = "" + tagsList + regularSeparator + tagPrefix + tag;
    }
  });
  return tagsList;
};
});

;require.register("lib/view_collection", function(exports, require, module) {
var BaseView, ViewCollection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = ViewCollection = (function(_super) {
  __extends(ViewCollection, _super);

  function ViewCollection() {
    this.removeItem = __bind(this.removeItem, this);
    this.addItem = __bind(this.addItem, this);
    return ViewCollection.__super__.constructor.apply(this, arguments);
  }

  ViewCollection.prototype.itemview = null;

  ViewCollection.prototype.views = {};

  ViewCollection.prototype.template = function() {
    return '';
  };

  ViewCollection.prototype.itemViewOptions = function() {};

  ViewCollection.prototype.collectionEl = null;

  ViewCollection.prototype.onChange = function() {
    return this.$el.toggleClass('empty', _.size(this.views) === 0);
  };

  ViewCollection.prototype.appendView = function(view) {
    return this.$collectionEl.append(view.el);
  };

  ViewCollection.prototype.initialize = function() {
    var collectionEl;
    ViewCollection.__super__.initialize.apply(this, arguments);
    this.views = {};
    this.listenTo(this.collection, "reset", this.onReset);
    this.listenTo(this.collection, "add", this.addItem);
    this.listenTo(this.collection, "remove", this.removeItem);
    if (this.collectionEl == null) {
      return collectionEl = el;
    }
  };

  ViewCollection.prototype.render = function() {
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      view.$el.detach();
    }
    return ViewCollection.__super__.render.apply(this, arguments);
  };

  ViewCollection.prototype.afterRender = function() {
    var id, view, _ref;
    this.$collectionEl = $(this.collectionEl);
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      this.appendView(view.$el);
    }
    this.onReset(this.collection);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.remove = function() {
    this.onReset([]);
    return ViewCollection.__super__.remove.apply(this, arguments);
  };

  ViewCollection.prototype.onReset = function(newcollection) {
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      view.remove();
    }
    return newcollection.forEach(this.addItem);
  };

  ViewCollection.prototype.addItem = function(model) {
    var options, view;
    options = _.extend({}, {
      model: model
    }, this.itemViewOptions(model));
    view = new this.itemView(options);
    this.views[model.cid] = view.render();
    this.appendView(view);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.removeItem = function(model) {
    this.views[model.cid].remove();
    delete this.views[model.cid];
    return this.onChange(this.views);
  };

  return ViewCollection;

})(BaseView);
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
  "archived tasks of": "Archived tasks related to %{tagsList}",
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
  "match criterion with tag": "and of criterion"
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
  "archived tasks of": "Tâches archivées de %{tagsList}",
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
  "match criterion with tag": "et au critère"
};
});

;require.register("models/task", function(exports, require, module) {
var Task,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Task = (function(_super) {
  __extends(Task, _super);

  function Task() {
    return Task.__super__.constructor.apply(this, arguments);
  }

  Task.prototype.set = function(attributes, options) {
    var tags;
    Task.__super__.set.call(this, attributes, options);
    if (attributes === "description") {
      tags = Task.extractTags(this.get('description'));
      return this.set('tags', tags);
    }
  };

  Task.prototype.containsTags = function(tags) {
    var lowerCasedTags;
    if (!(tags instanceof Array)) {
      tags = [tags];
    }
    if (tags.length === 0) {
      return this.get('tags').length === 0;
    } else {
      lowerCasedTags = this.get('tags').map(function(tag) {
        return tag.toLowerCase();
      });
      return _.every(tags, _.partial(_.contains, lowerCasedTags));
    }
  };

  Task.prototype.doesntContainsTags = function(tags) {
    var lowerCasedTags;
    if (!(tags instanceof Array)) {
      tags = [tags];
    }
    if (tags.length === 0) {
      return true;
    } else {
      lowerCasedTags = this.get('tags').map(function(tag) {
        return tag.toLowerCase();
      });
      return !_.some(tags, _.partial(_.contains, lowerCasedTags));
    }
  };

  Task.prototype.getPreviousWithTags = function(tags) {
    var nextIndex, nextTask, order, subCollection;
    order = this.get('order');
    subCollection = this.collection.getByTags(tags);
    nextTask = subCollection.find(function(task) {
      return ((tags != null) && task.get('order') > order && task.containsTags(tags)) || ((tags == null) && task.get('order') > order);
    });
    nextIndex = subCollection.indexOf(nextTask);
    if (nextIndex === -1) {
      return _.last(subCollection.toArray());
    } else {
      return subCollection.at(nextIndex - 1);
    }
  };

  Task.regex = /(^|\s)#([\w\d\-_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)(?=\s|$)/g;

  Task.extractTags = function(desc) {
    var tags;
    tags = desc.match(Task.regex);
    tags = _.unique(tags);
    tags = _.map(tags, function(tag) {
      return tag.trim().replace('#', '');
    });
    return tags;
  };

  return Task;

})(Backbone.Model);
});

;require.register("router", function(exports, require, module) {
var AppView, ArchivedTaskCollection, ArchivedTaskListView, MenuView, Router, Task, TaskCollection, TaskListView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppView = require('views/app_view');

MenuView = require('views/menu_view');

TaskListView = require('views/task_list_view');

ArchivedTaskListView = require('views/archive_list_view');

TaskCollection = require('collections/tasks');

ArchivedTaskCollection = require('collections/archived_tasks');

Task = require('models/task');

module.exports = Router = (function(_super) {
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

  Router.prototype.initialize = function() {
    this.collection = new TaskCollection(initTasks);
    this.archivedCollection = new ArchivedTaskCollection(archivedTasks);
    this.mainView = new AppView();
    this.mainView.render();
    this.menu = new MenuView({
      baseCollection: this.collection,
      archivedCollection: this.archivedCollection
    });
    this.taskList = new TaskListView({
      baseCollection: this.collection
    });
    this.listenTo(this.taskList, 'archive-tasks', (function(_this) {
      return function(tasks) {
        _this.collection.remove(tasks);
        _this.archivedCollection.add(tasks);
        return _this.taskList.render();
      };
    })(this));
    this.archivedTaskList = new ArchivedTaskListView({
      baseCollection: this.archivedCollection
    });
    return this.listenTo(this.archivedTaskList, 'restore-task', (function(_this) {
      return function(task) {
        _this.archivedCollection.remove(task);
        _this.collection.add(task);
        return _this.archivedTaskList.render();
      };
    })(this));
  };

  Router.prototype.main = function(followUp) {
    if (followUp == null) {
      followUp = false;
    }
    if (!followUp) {
      this.taskList.setSearchQuery(null);
    }
    this.taskList.setTags(null);
    this.taskList.render();
    this.menu.setViewType('#tobedone');
    this.menu.setActive(null);
    return this.menu.render();
  };

  Router.prototype.mainSearch = function(query) {
    this.taskList.setSearchQuery(query);
    return this.main(true);
  };

  Router.prototype.archived = function() {
    this.archivedTaskList.setTags(null);
    this.archivedTaskList.render();
    this.menu.setViewType('#archived');
    this.menu.setActive(null);
    return this.menu.render();
  };

  Router.prototype.byTags = function(viewType, listView, tags, searchQuery) {
    if (searchQuery == null) {
      searchQuery = null;
    }
    if (tags != null) {
      tags = tags.split('/');
      if (tags[tags.length - 1].length === 0) {
        delete tags[tags.length - 1];
      }
    } else {
      tags = [];
    }
    listView.setTags(tags);
    if (viewType === '#tobedone') {
      listView.setSearchQuery(searchQuery);
    }
    listView.render();
    this.menu.setViewType(viewType);
    this.menu.setActive(tags);
    return this.menu.render();
  };

  Router.prototype.todoByTags = function(tags) {
    return this.byTags('#tobedone', this.taskList, tags);
  };

  Router.prototype.todoByTagsWithSearch = function(tags, query) {
    if (query == null) {
      query = tags;
      tags = null;
    }
    return this.byTags('#tobedone', this.taskList, tags, query);
  };

  Router.prototype.archivedByTags = function(tags) {
    return this.byTags('#archived', this.archivedTaskList, tags);
  };

  return Router;

})(Backbone.Router);
});

;require.register("views/app_view", function(exports, require, module) {
var AppView, BaseView, MenuView, TaskListView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

MenuView = require('./menu_view');

TaskListView = require('./task_list_view');

module.exports = AppView = (function(_super) {
  __extends(AppView, _super);

  function AppView() {
    return AppView.__super__.constructor.apply(this, arguments);
  }

  AppView.prototype.el = 'body';

  AppView.prototype.template = require('./templates/home');

  return AppView;

})(BaseView);
});

;require.register("views/archive_list_view", function(exports, require, module) {
var ArchiveListView, ArchiveTaskView, BaseView, Task, TaskFormView, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

Utils = require('../lib/utils');

Task = require('../models/task');

ArchiveTaskView = require('./archive_task_view');

TaskFormView = require('./task_form_view');

module.exports = ArchiveListView = (function(_super) {
  __extends(ArchiveListView, _super);

  ArchiveListView.prototype.el = '.container';

  ArchiveListView.prototype.template = require('./templates/task_list_archive');

  ArchiveListView.prototype.views = null;

  ArchiveListView.prototype.collectionEl = 'ul#task-list';

  function ArchiveListView(options) {
    this.baseCollection = options.baseCollection;
    this.views = new Backbone.ChildViewContainer();
    ArchiveListView.__super__.constructor.call(this, options);
  }

  ArchiveListView.prototype.setTags = function(tags) {
    this.selectedTags = tags;
    if (this.collection != null) {
      this.stopListening(this.collection);
      delete this.collection;
    }
    this.collection = this.baseCollection.getByTags(this.selectedTags);
    this.listenTo(this.collection, 'add', this.render);
    this.listenTo(this.collection, 'remove', this.render);
    return this.listenTo(this.collection, 'change', (function(_this) {
      return function(task) {
        var taskView;
        if (!(task != null ? task.get('isArchived') : void 0)) {
          taskView = _this.views.findByModel(task);
          return taskView.$el.fadeOut(function() {
            _this.stopListening(taskView);
            _this.views.remove(taskView);
            taskView.destroy();
            return _this.trigger('restore-task', task);
          });
        }
      };
    })(this));
  };

  ArchiveListView.prototype.getRenderData = function() {
    return {
      title: this.getTitle()
    };
  };

  ArchiveListView.prototype.beforeRender = function() {
    return this.views.forEach((function(_this) {
      return function(taskView) {
        if (_this.collection.indexOf(taskView.model) !== -1) {
          return taskView.$el.detach();
        } else {
          _this.stopListening(taskView);
          _this.views.remove(taskView);
          return taskView.destroy();
        }
      };
    })(this));
  };

  ArchiveListView.prototype.afterRender = function() {
    this.collection.forEach((function(_this) {
      return function(task) {
        var taskView;
        taskView = _this.views.findByModel(task);
        if (taskView == null) {
          taskView = new ArchiveTaskView({
            model: task
          });
          _this.views.add(taskView);
        } else {
          taskView.delegateEvents();
        }
        return $(_this.collectionEl).append(taskView.render().$el);
      };
    })(this));
    return this.$el;
  };

  ArchiveListView.prototype.getTitle = function() {
    var tagsList;
    if (this.collection.length === this.baseCollection.length) {
      return t('all archived tasks');
    } else {
      tagsList = Utils.buildTagsList(this.selectedTags, {
        tagPrefix: '#',
        regularSeparator: ', ',
        lastSeparator: " " + (t('and')) + " "
      });
      return t('archived tasks of', {
        tagsList: tagsList,
        smart_count: this.selectedTags.length
      });
    }
  };

  return ArchiveListView;

})(BaseView);
});

;require.register("views/archive_task_view", function(exports, require, module) {
var ArchiveTaskView, TaskView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TaskView = require('./task_view');

module.exports = ArchiveTaskView = (function(_super) {
  __extends(ArchiveTaskView, _super);

  function ArchiveTaskView() {
    return ArchiveTaskView.__super__.constructor.apply(this, arguments);
  }

  ArchiveTaskView.prototype.tagName = 'li';

  ArchiveTaskView.prototype.className = 'task archive done';

  ArchiveTaskView.prototype.template = require('./templates/task_archive');

  ArchiveTaskView.prototype.getRenderData = function() {
    var date;
    date = Date.create(this.model.get('completionDate'));
    return _.extend(ArchiveTaskView.__super__.getRenderData.call(this), {
      competionDate: date.format(t('archived date format'))
    });
  };

  ArchiveTaskView.prototype.afterRender = function() {};

  ArchiveTaskView.prototype.onClick = function() {
    this.model.set('done', false);
    this.model.set('completionDate', null);
    this.model.set('isArchived', false);
    this.model.save();
    return this.render();
  };

  ArchiveTaskView.prototype.onMouseEnter = function() {
    var button;
    button = this.$('button');
    if (this.model.get('done')) {
      button.prop('title', t('restore button?'));
      return button.html(t('restore button?'));
    }
  };

  ArchiveTaskView.prototype.onMouseLeave = function() {
    var button;
    button = this.$('button');
    if (this.model.get('done')) {
      return button.html(t('done button'));
    }
  };

  return ArchiveTaskView;

})(TaskView);
});

;require.register("views/breadcrumb_item", function(exports, require, module) {
var BaseView, BreadcrumbItemView, Task, Utils, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

Utils = require('../lib/utils');

app = require('../application');

Task = require('../models/task');

module.exports = BreadcrumbItemView = (function(_super) {
  __extends(BreadcrumbItemView, _super);

  BreadcrumbItemView.prototype.tagName = 'div';

  BreadcrumbItemView.prototype.className = 'breadcrumb-item';

  BreadcrumbItemView.prototype.template = function(value) {
    return "<span>" + value + "</span><a>×</a>";
  };

  BreadcrumbItemView.prototype.events = {
    'mouseover a': 'onRemoveHovered',
    'mouseout a': 'onRemoveHovered',
    'click a': 'onRemoveClicked',
    'click span': 'onClicked'
  };

  function BreadcrumbItemView(options) {
    this.type = options.type;
    if (options.type === 'tag') {
      if (options.model.indexOf('!') === 0) {
        this.className = "" + this.className + " excluded";
      } else {
        this.className = "" + this.className;
      }
    }
    BreadcrumbItemView.__super__.constructor.call(this, options);
  }

  BreadcrumbItemView.prototype.getRenderData = function() {
    if (this.type === 'tag') {
      if (this.model.indexOf('!') === 0) {
        return "#" + (this.model.substr(1));
      } else {
        return "#" + this.model;
      }
    } else {
      return "\"" + this.model + "\"";
    }
  };

  BreadcrumbItemView.prototype.onRemoveHovered = function() {
    return this.$el.toggleClass('notice-delete-action');
  };

  BreadcrumbItemView.prototype.onRemoveClicked = function() {
    return this.$el.fadeOut((function(_this) {
      return function() {
        _this.destroy();
        return _this.trigger('remove');
      };
    })(this));
  };

  BreadcrumbItemView.prototype.onClicked = function(evt) {
    if (this.model.indexOf('!') === 0) {
      this.model = this.model.substr(1);
    } else {
      this.model = "!" + this.model;
    }
    return this.trigger('change');
  };

  return BreadcrumbItemView;

})(BaseView);
});

;require.register("views/breadcrumb_view", function(exports, require, module) {
var BaseView, BreadcrumbItemView, BreadcrumbView, Task, Utils, app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BaseView = require('../lib/base_view');

BreadcrumbItemView = require('./breadcrumb_item');

Utils = require('../lib/utils');

app = require('../application');

Task = require('../models/task');

module.exports = BreadcrumbView = (function(_super) {
  __extends(BreadcrumbView, _super);

  BreadcrumbView.prototype.el = '#breadcrumb';

  BreadcrumbView.prototype.views = null;

  function BreadcrumbView(options) {
    this.adjustInputSize = __bind(this.adjustInputSize, this);
    this.onInputChange = __bind(this.onInputChange, this);
    this.baseCollection = options.baseCollection;
    this.selectedTags = options.selectedTags;
    this.collectionLength = options.collectionLength;
    this.searchQuery = options.searchQuery;
    this.views = new Backbone.ChildViewContainer();
    BreadcrumbView.__super__.constructor.call(this, options);
  }

  BreadcrumbView.prototype.render = function() {
    var _ref;
    this.noTagSelected = (this.selectedTags == null) || ((_ref = this.selectedTags) != null ? _ref.length : void 0) === 0;
    if (this.selectedTags == null) {
      this.$el.append(t('all tasks'));
    } else if (this.noTagSelected) {
      this.$el.append(t('untagged tasks'));
    } else {
      this.$el.append(t('tasks of', {
        smart_count: this.selectedTags.length
      }));
    }
    if (this.selectedTags != null) {
      this.renderSelectedTags();
    }
    if (this.searchQuery != null) {
      this.renderSearchInput();
    }
    if ((this.selectedTags == null) || ((this.selectedTags != null) && !this.noTagSelected)) {
      return this.renderDefaultInput();
    }
  };

  BreadcrumbView.prototype.renderSelectedTags = function() {
    var breadcrumbItem, tag, tagInput, _i, _len, _ref, _results;
    _ref = this.selectedTags;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tag = _ref[_i];
      breadcrumbItem = new BreadcrumbItemView({
        model: tag,
        type: 'tag'
      });
      this.listenTo(breadcrumbItem, 'remove', (function(_this) {
        return function() {
          return _this.views.remove(breadcrumbItem);
        };
      })(this));
      this.listenTo(breadcrumbItem, 'change remove', this.onInputChange);
      this.views.add(breadcrumbItem);
      tagInput = breadcrumbItem.render().$el;
      _results.push(this.$el.append(tagInput));
    }
    return _results;
  };

  BreadcrumbView.prototype.renderSearchInput = function() {
    var breadcrumbItem, searchInput, translationKey;
    translationKey = 'match criterion';
    if (this.noTagSelected) {
      translationKey = "" + translationKey + " no tag";
    } else {
      translationKey = "" + translationKey + " with tag";
    }
    breadcrumbItem = new BreadcrumbItemView({
      model: this.searchQuery,
      type: 'searcg'
    });
    this.listenTo(breadcrumbItem, 'remove', (function(_this) {
      return function() {
        return _this.views.remove(breadcrumbItem);
      };
    })(this));
    this.listenTo(breadcrumbItem, 'change remove', this.onInputChange);
    this.views.add(breadcrumbItem);
    searchInput = breadcrumbItem.render().$el;
    return this.$el.append(searchInput);
  };

  BreadcrumbView.prototype.renderDefaultInput = function() {
    var className, newTagInput, placeholder;
    this.$sizeCalculator = $('<span class="size-calculator"></span>');
    this.$el.append(this.$sizeCalculator);
    className = "class='add-tag'";
    placeholder = "placeholder='" + (t('search tag input')) + "'";
    newTagInput = $("<input " + className + " type='text' " + placeholder + "/>");
    this.$el.find('.size-calculator').before(newTagInput);
    return this.bindInputEvents(newTagInput);
  };

  BreadcrumbView.prototype.bindInputEvents = function(input) {
    this.adjustInputSize({
      currentTarget: input
    });
    input.change(this.onInputChange);
    return input.keypress(this.adjustInputSize);
  };

  BreadcrumbView.prototype.onInputChange = function(evt) {
    var allTags, detectedTags, hasTasksRelatedTo, inputEl, location, newInput, newInputVal, query, rawTags, searchInput, searchInputVal, searchLocation, tags, _ref;
    if (evt != null) {
      inputEl = $(evt.currentTarget);
      detectedTags = inputEl.val().match(Task.regex);
      if (detectedTags != null) {
        inputEl.val(detectedTags[0]);
        this.adjustInputSize(evt);
      }
    }
    tags = [];
    this.views.forEach(function(view) {
      var query, tag, value;
      value = view.model;
      if (view.type === 'tag') {
        tag = value.replace('#', '');
        if (tag.length > 0) {
          return tags.push(tag);
        }
      } else {
        return query = value.substr(1, value.length - 2);
      }
    });
    newInput = this.$('input.add-tag');
    newInputVal = newInput.val();
    if ((newInput != null) && (newInputVal = newInput.val()).length > 0) {
      if (newInputVal.indexOf('#') === 0 || newInputVal.indexOf('!#') === 0) {
        newInputVal = newInputVal.replace('#', '');
        tags.push(newInputVal);
      } else {
        if (typeof query !== "undefined" && query !== null) {
          query = "" + query + " " + newInputVal;
        } else {
          query = newInputVal;
        }
      }
    }
    tags = _.uniq(tags);
    if (query == null) {
      searchInput = this.$('input.search');
      if ((searchInput != null) && ((_ref = (searchInputVal = searchInput.val())) != null ? _ref.length : void 0) > 0) {
        query = searchInputVal;
      } else {
        query = null;
      }
    }
    if ((tags != null) && tags.length === 0) {
      if (query != null) {
        location = "#search/" + query;
      } else {
        location = '#';
      }
      return app.router.navigate(location, true);
    } else {
      allTags = this.baseCollection.getAllTags().pluck('id');
      rawTags = _.map(tags, function(tag) {
        if (tag.indexOf('!') === 0) {
          return tag.substr(1);
        } else {
          return tag;
        }
      });
      if (_.every(rawTags, (function(tag) {
        return __indexOf.call(allTags, tag) >= 0;
      }))) {
        hasTasksRelatedTo = this.baseCollection.getByTags(tags).length > 0;
        if (hasTasksRelatedTo) {
          tags = tags.join('/');
          searchLocation = query != null ? "/;search/" + query : '';
          location = "#todoByTags/" + tags + searchLocation;
          return app.router.navigate(location, true);
        } else {
          if (evt != null) {
            return $(evt.currentTarget).addClass('error');
          }
        }
      } else {
        if (evt != null) {
          return $(evt.currentTarget).addClass('error');
        }
      }
    }
  };

  BreadcrumbView.prototype.adjustInputSize = function(evt) {
    var char, inputEl, inputVal, key, widthToSet;
    inputEl = $(evt.currentTarget);
    key = evt.keyCode || evt.charCode;
    char = String.fromCharCode(key);
    inputVal = inputEl.val();
    if (inputVal.length === 0) {
      inputVal = inputEl.prop('placeholder');
    }
    this.$sizeCalculator.text(inputVal + char);
    widthToSet = this.$sizeCalculator.width();
    return inputEl.width(widthToSet);
  };

  BreadcrumbView.prototype.destroy = function() {
    return this.views.forEach(function(view) {
      return this.stopListening(view);
    });
  };

  return BreadcrumbView;

})(BaseView);
});

;require.register("views/menu_item_view", function(exports, require, module) {
var BaseView, MenuItemView, TagsCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

TagsCollection = require('../collections/tags');

module.exports = MenuItemView = (function(_super) {
  __extends(MenuItemView, _super);

  MenuItemView.prototype.tagName = 'li';

  MenuItemView.prototype.className = 'menu-tag';

  MenuItemView.prototype.template = require('./templates/menu_item');

  MenuItemView.prototype.collectionEl = 'ul.submenu';

  MenuItemView.prototype.views = null;

  MenuItemView.prototype.events = {
    'click': 'onClick'
  };

  function MenuItemView(options) {
    this.baseCollection = options.baseCollection;
    this.archivedCollection = options.archivedCollection;
    this.selectedTags = options.selectedTags;
    this.depth = options.depth;
    this.viewType = options.viewType;
    this.views = new Backbone.ChildViewContainer();
    MenuItemView.__super__.constructor.call(this, options);
  }

  MenuItemView.prototype.getRenderData = function() {
    var params;
    params = MenuItemView.__super__.getRenderData.call(this);
    _.extend(params, {
      url: this.buildUrl()
    });
    return params;
  };

  MenuItemView.prototype.buildUrl = function() {
    var currentIndex, prefix, tagsInUrl, url, _ref, _ref1, _ref2, _ref3;
    tagsInUrl = ((_ref = this.selectedTags) != null ? _ref.slice(0, this.depth) : void 0) || [];
    currentIndex = (_ref1 = this.selectedTags) != null ? _ref1.indexOf(this.model.get('tagName')) : void 0;
    if ((!_.contains(tagsInUrl, this.model.get('tagName')) || ((_ref2 = this.selectedTags) != null ? _ref2.length : void 0) > this.depth + 1) && (!(currentIndex + 1 === ((_ref3 = this.selectedTags) != null ? _ref3.length : void 0) && this.depth === currentIndex))) {
      tagsInUrl.push(this.model.get('tagName'));
    }
    if (this.viewType === "#tobedone") {
      url = "#";
      prefix = 'todoByTags';
    } else {
      url = "#archived";
      prefix = 'archivedByTags';
    }
    if (tagsInUrl.length > 0) {
      url = "#" + prefix;
      tagsInUrl.forEach(function(item) {
        return url = "" + url + "/" + item;
      });
    }
    return url;
  };

  MenuItemView.prototype.beforeRender = function() {
    if (this.model.get('isMagic')) {
      return this.$el.addClass('magic');
    }
  };

  MenuItemView.prototype.afterRender = function() {
    var currentIndex, leftPadding, tags, _ref;
    currentIndex = (_ref = this.selectedTags) != null ? _ref.indexOf(this.model.get('tagName')) : void 0;
    if (currentIndex === this.depth) {
      this.$el.addClass('active');
      if (this.depth + 1 === this.selectedTags.length) {
        this.$el.addClass('selected');
      }
    }
    leftPadding = (this.depth + 1) * 25;
    this.$('a').css('padding-left', leftPadding);
    if ((this.selectedTags != null) && this.selectedTags[this.depth] === this.model.get('tagName')) {
      tags = this.buildTagsList();
      return tags.forEach((function(_this) {
        return function(tagInfo) {
          var menuItem;
          menuItem = new MenuItemView({
            model: new Backbone.Model({
              tagName: tagInfo.get('id'),
              count: tagInfo.get('count')
            }),
            selectedTags: _this.selectedTags,
            depth: _this.depth + 1,
            viewType: _this.viewType,
            baseCollection: _this.baseCollection,
            archivedCollection: _this.archivedCollection
          });
          _this.views.add(menuItem);
          return _this.$el.children(_this.collectionEl).append(menuItem.render().$el);
        };
      })(this));
    }
  };

  MenuItemView.prototype.buildTagsList = function() {
    var collection, excludedItems, includedTags, tagsList;
    excludedItems = this.selectedTags || [];
    excludedItems = excludedItems.slice(0, this.depth + 1);
    includedTags = this.selectedTags || [];
    includedTags = includedTags.slice(0, this.depth + 1);
    if (this.collection != null) {
      delete this.collection;
    }
    if (this.viewType === "#tobedone") {
      collection = this.baseCollection;
    } else {
      collection = this.archivedCollection;
    }
    this.collection = collection.getByTags(includedTags);
    tagsList = TagsCollection.extractFromTasks(this.collection, excludedItems, this.selectedTags);
    return tagsList;
  };

  return MenuItemView;

})(BaseView);
});

;require.register("views/menu_view", function(exports, require, module) {
var BaseView, MenuItemView, MenuView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

MenuItemView = require('./menu_item_view');

module.exports = MenuView = (function(_super) {
  __extends(MenuView, _super);

  MenuView.prototype.el = '#menu';

  MenuView.prototype.template = require('./templates/menu');

  MenuView.prototype.views = null;

  MenuView.prototype.collectionEl = 'ul.tags';

  MenuView.prototype.activeTags = null;

  MenuView.prototype.subMenuHandler = null;

  function MenuView(options) {
    this.baseCollection = options.baseCollection;
    this.archivedCollection = options.archivedCollection;
    this.views = new Backbone.ChildViewContainer();
    MenuView.__super__.constructor.call(this, options);
  }

  MenuView.prototype.initialize = function(options) {
    this.listenTo(this.baseCollection, {
      'add': this.onChange,
      'change': this.onChange,
      'remove': this.onChange
    });
    this.listenTo(this.archivedCollection, {
      'add': this.onChange,
      'change': this.onChange,
      'remove': this.onChange
    });
    return MenuView.__super__.initialize.call(this, options);
  };

  MenuView.prototype.getRenderData = function() {
    var archivedCount;
    if (this.archivedCollection.length > 1000) {
      archivedCount = 'Over 9000++';
    } else {
      archivedCount = this.archivedCollection.length;
    }
    return {
      allCount: this.baseCollection.length,
      untaggedCount: this.baseCollection.filter(function(task) {
        return task.get('tags').length === 0;
      }).length,
      archivedCount: archivedCount
    };
  };

  MenuView.prototype.beforeRender = function() {
    var tagsList;
    tagsList = this.baseCollection.getAllTags();
    return this.views.forEach((function(_this) {
      return function(taskView) {
        if (tagsList.indexOf(taskView.model.get('tagName')) !== -1) {
          return taskView.$el.detach();
        } else {
          _this.stopListening(taskView);
          _this.views.remove(taskView);
          return taskView.destroy();
        }
      };
    })(this));
  };

  MenuView.prototype.afterRender = function() {
    var archivedListEl, isActive, prefix, search, submenuEl, tags, template, typeViewEl, untaggedNum, untaggedView, untaggedViewContent, _ref;
    typeViewEl = this.$("" + this.viewType);
    submenuEl = this.$("" + this.viewType + " > .submenu");
    if (this.viewType === "#tobedone") {
      this.collection = this.baseCollection;
    } else {
      this.collection = this.archivedCollection;
    }
    untaggedNum = this.collection.filter(function(task) {
      return task.get('tags').length === 0;
    }).length;
    if (untaggedNum > 0) {
      template = require('./templates/menu_item');
      if (this.viewType === "#tobedone") {
        prefix = 'todoByTags';
      } else {
        prefix = 'archivedByTags';
      }
      if (this.searchQuery != null) {
        search = ";search/" + this.searchQuery;
      } else {
        search = '';
      }
      isActive = ((_ref = this.activeTags) != null ? _ref.length : void 0) === 0 ? " active selected" : "";
      untaggedView = $('<li class="menu-tag magic' + isActive + '"></li>');
      untaggedViewContent = template({
        url: "#" + prefix + "/" + search,
        model: {
          tagName: t('untagged'),
          count: untaggedNum
        }
      });
      untaggedView.append(untaggedViewContent);
      submenuEl.append(untaggedView);
    }
    if (this.viewType === "#tobedone") {
      archivedListEl = this.$('#archived');
      this.$('ul:first-child').prepend(archivedListEl);
    }
    tags = this.collection.getAllTags();
    tags.forEach((function(_this) {
      return function(tagInfo) {
        var menuItem;
        menuItem = new MenuItemView({
          model: new Backbone.Model({
            tagName: tagInfo.get('id'),
            count: tagInfo.get('count'),
            isMagic: tagInfo.get('isMagic')
          }),
          selectedTags: _this.activeTags,
          depth: 0,
          viewType: _this.viewType,
          baseCollection: _this.baseCollection,
          archivedCollection: _this.archivedCollection
        });
        _this.views.add(menuItem);
        return submenuEl.append(menuItem.render().$el);
      };
    })(this));
    typeViewEl.addClass('active');
    if (this.activeTags == null) {
      typeViewEl.addClass('selected');
    }
    return this.$el;
  };

  MenuView.prototype.onChange = function() {
    return this.render();
  };

  MenuView.prototype.setActive = function(tags) {
    return this.activeTags = tags;
  };

  MenuView.prototype.setViewType = function(viewType) {
    return this.viewType = viewType;
  };

  return MenuView;

})(BaseView);
});

;require.register("views/task_form_view", function(exports, require, module) {
var BaseView, TaskFormView, TaskView, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BaseView = require('../lib/base_view');

Utils = require('../lib/utils');

TaskView = require('./task_view');

module.exports = TaskFormView = (function(_super) {
  __extends(TaskFormView, _super);

  function TaskFormView() {
    return TaskFormView.__super__.constructor.apply(this, arguments);
  }

  TaskFormView.prototype.el = '#new-task';

  TaskFormView.prototype.template = require('./templates/task_form');

  TaskFormView.prototype.events = {
    'keydown input': 'onKeydown',
    'keyup input': 'onKeyup',
    'blur input': 'onSubmit',
    'click button': 'onSubmit'
  };

  TaskFormView.prototype.initialize = function(options) {
    TaskFormView.__super__.initialize.call(this);
    return this.tags = options.tags;
  };

  TaskFormView.prototype.onKeydown = function(event) {
    var authorizedComboKeys, inputVal, key, neutralKeys, tagsList;
    key = event.keyCode || event.charCode;
    inputVal = this.$('input').val();
    tagsList = Utils.buildTagsList(this.tags, {
      tagPrefix: '#'
    });
    if (tagsList !== "") {
      tagsList = "" + tagsList + " ";
    }
    neutralKeys = [8, 32, 9, 13, 38, 40, 37, 39];
    authorizedComboKeys = [220, 86];
    if (inputVal.length === 0 && __indexOf.call(neutralKeys, key) < 0 && (!(event.metaKey || event.ctrlKey || event.altKey) || __indexOf.call(authorizedComboKeys, key) >= 0)) {
      this.$('input').val(tagsList);
      return inputVal = tagsList;
    }
  };

  TaskFormView.prototype.onKeyup = function(event) {
    var inputVal, key;
    key = event.keyCode || event.charCode;
    inputVal = this.$('input').val();
    if (inputVal.length === 0) {
      this.$('button').addClass('disabled');
    } else {
      this.$('button').removeClass('disabled');
    }
    if (key === 13) {
      this.onSubmit();
    }
    if (key === 40) {
      return this.trigger('focus-down');
    }
  };

  TaskFormView.prototype.onSubmit = function() {
    var inputVal;
    inputVal = this.$('input').val();
    if (inputVal.length > 0) {
      this.trigger('new-task-submitted', {
        content: inputVal
      });
    }
    return this.$('input').val('');
  };

  TaskFormView.prototype.getRenderData = function() {
    return {
      formPlaceholder: this.getFormPlaceholder()
    };
  };

  TaskFormView.prototype.getFormPlaceholder = function() {
    var tagsList;
    tagsList = Utils.buildTagsList(this.tags, {
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
  };

  return TaskFormView;

})(BaseView);
});

;require.register("views/task_list_view", function(exports, require, module) {
var BaseView, BreadcrumbView, Task, TaskFormView, TaskListView, TaskView, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

Utils = require('../lib/utils');

Task = require('../models/task');

TaskView = require('./task_view');

TaskFormView = require('./task_form_view');

BreadcrumbView = require('./breadcrumb_view');

module.exports = TaskListView = (function(_super) {
  __extends(TaskListView, _super);

  TaskListView.prototype.el = '.container';

  TaskListView.prototype.template = require('./templates/task_list');

  TaskListView.prototype.views = null;

  TaskListView.prototype.collectionEl = 'ul#task-list';

  TaskListView.prototype.isReindexing = false;

  TaskListView.prototype.events = {
    'click #archive-action': 'onArchiveClicked',
    'onkeydown h1 input': 'onKeyDownMenuInput'
  };

  TaskListView.prototype.reindex = function() {
    return this.baseCollection.reindex();
  };

  function TaskListView(options) {
    this.baseCollection = options.baseCollection;
    this.views = new Backbone.ChildViewContainer();
    TaskListView.__super__.constructor.call(this, options);
  }

  TaskListView.prototype.initialize = function() {
    this.listenTo(this.baseCollection, 'reindexing', function() {
      this.isReindexing = true;
      $('#block').show();
      return $('#modal').show();
    });
    return this.listenTo(this.baseCollection, 'reindexed', function(error) {
      this.isReindexing = false;
      $('#block').hide();
      $('#modal').hide();
      if (error != null) {
        return console.log(error);
      }
    });
  };

  TaskListView.prototype.setSearchQuery = function(searchQuery) {
    return this.searchQuery = searchQuery;
  };

  TaskListView.prototype.setTags = function(tags) {
    this.selectedTags = tags;
    if (this.collection != null) {
      this.stopListening(this.collection);
      delete this.collection;
    }
    this.collection = this.baseCollection.getByTags(this.selectedTags);
    this.listenTo(this.collection, 'add', this.render);
    this.listenTo(this.collection, 'remove', (function(_this) {
      return function(task) {
        var previousVisibleTask;
        previousVisibleTask = task.getPreviousWithTags(_this.selectedTags);
        if (previousVisibleTask != null) {
          _this.taskModelCIDToFocus = previousVisibleTask.cid;
        }
        return _this.render();
      };
    })(this));
    return this.listenTo(this.collection, 'change', (function(_this) {
      return function(task) {
        return _this.updateArchiveButtonState();
      };
    })(this));
  };

  TaskListView.prototype.getRenderData = function() {
    return {
      title: this.getTitle()
    };
  };

  TaskListView.prototype.beforeRender = function() {
    return this.views.forEach((function(_this) {
      return function(taskView) {
        if (_this.collection.indexOf(taskView.model) !== -1) {
          return taskView.$el.detach();
        } else {
          _this.stopListening(taskView);
          _this.views.remove(taskView);
          return taskView.destroy();
        }
      };
    })(this));
  };

  TaskListView.prototype.afterRender = function() {
    var list, regex, view;
    this.updateArchiveButtonState();
    if (this.taskForm != null) {
      this.stopListening(this.taskForm);
      this.taskForm.destroy();
    }
    if (this.searchQuery == null) {
      this.taskForm = new TaskFormView({
        tags: this.selectedTags
      });
      this.listenTo(this.taskForm, 'new-task-submitted', this.createNewTask);
      this.listenTo(this.taskForm, 'focus-down', this.onFocusDown);
      this.taskForm.render();
    }
    if (this.searchQuery != null) {
      regex = new RegExp(this.searchQuery, 'i');
      list = this.collection.filter(function(task) {
        return regex.test(task.get('description'));
      });
    } else {
      list = this.collection;
    }
    list.forEach((function(_this) {
      return function(task) {
        var taskView;
        taskView = _this.views.findByModel(task);
        if (taskView == null) {
          taskView = new TaskView({
            model: task
          });
          _this.views.add(taskView);
          _this.listenTo(taskView, 'new-task-submitted', _this.createNewTask);
          _this.listenTo(taskView, 'focus-up', _this.onFocusUp);
          _this.listenTo(taskView, 'focus-down', _this.onFocusDown);
          _this.listenTo(taskView, 'move-up', _this.onMoveUp);
          _this.listenTo(taskView, 'move-down', _this.onMoveDown);
        } else {
          taskView.delegateEvents();
        }
        return $(_this.collectionEl).append(taskView.render().$el);
      };
    })(this));
    this.renderFormTitle();
    if (this.taskModelCIDToFocus != null) {
      view = this.views.findByModelCid(this.taskModelCIDToFocus);
      if (view != null) {
        view.setFocus();
      } else {
        console.log("something went wrong trying to focus");
        this.taskForm.$el.find('input').focus();
      }
      this.taskModelCIDToFocus = null;
    } else {
      if (this.taskForm != null) {
        this.taskForm.$el.find('input').focus();
      }
    }
    return this.$el;
  };

  TaskListView.prototype.renderFormTitle = function() {
    var breadcrumbView;
    breadcrumbView = new BreadcrumbView({
      selectedTags: this.selectedTags,
      collectionLength: this.collection.length,
      baseCollection: this.baseCollection,
      searchQuery: this.searchQuery
    });
    return breadcrumbView.render();
  };

  TaskListView.prototype.getTitle = function() {
    var tagsList;
    if (this.collection.length === this.baseCollection.length) {
      return t('all tasks');
    } else if ((this.selectedTags != null) && this.selectedTags.length === 0) {
      return t('untagged tasks');
    } else {
      tagsList = Utils.buildTagsList(this.selectedTags, {
        tagPrefix: '#',
        regularSeparator: ', ',
        lastSeparator: " " + (t('and')) + " "
      });
      tagsList = '';
      return t('tasks of', {
        tagsList: tagsList,
        smart_count: this.selectedTags.length
      });
    }
  };

  TaskListView.prototype.createNewTask = function(options) {
    var content, index, newNext, nextIndex, order, previous, step, tagsList, task, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    if (this.isReindexing) {
      return;
    }
    tagsList = Utils.buildTagsList(this.selectedTags, {
      tagPrefix: '#'
    });
    if (tagsList !== "") {
      tagsList = "" + tagsList + " ";
    }
    content = options.content || tagsList;
    if (options.previous != null) {
      previous = this.views.findByModelCid(options.previous).model;
      nextIndex = this.baseCollection.indexOf(previous) + 1;
      newNext = this.baseCollection.at(nextIndex);
      _ref = this.baseCollection.getNewOrder(previous, newNext), order = _ref.order, step = _ref.step;
      index = nextIndex;
    } else {
      newNext = this.baseCollection.at(0);
      _ref1 = this.baseCollection.getNewOrder(null, newNext), order = _ref1.order, step = _ref1.step;
      index = 0;
    }
    task = new Task({
      description: content,
      order: order,
      tags: Task.extractTags(content)
    });
    this.taskModelCIDToFocus = options.previous != null ? task.cid : null;
    this.baseCollection.create(task, {
      at: index
    });
    return this.checkIfReindexationIsNeeded(step);
  };

  TaskListView.prototype.onFocusUp = function(cid) {
    var currentModel, previousIndex, previousModel;
    currentModel = this.views.findByModelCid(cid).model;
    previousIndex = this.collection.indexOf(currentModel) - 1;
    previousModel = this.collection.at(previousIndex);
    if (previousIndex >= 0) {
      return this.views.findByModel(previousModel).setFocus();
    } else {
      return this.taskForm.$el.find('input').focus();
    }
  };

  TaskListView.prototype.onFocusDown = function(cid) {
    var currentModel, nextIndex, nextModel;
    if (cid != null) {
      currentModel = this.views.findByModelCid(cid).model;
      nextIndex = this.collection.indexOf(currentModel) + 1;
      nextModel = this.collection.at(nextIndex);
    } else {
      nextIndex = 0;
      nextModel = this.collection.at(nextIndex);
    }
    if (nextIndex < this.views.length) {
      return this.views.findByModel(nextModel).setFocus();
    }
  };

  TaskListView.prototype.onMoveUp = function(cid, toFocus) {
    var currentModel, newOrder, order, previous, previousIndex, previousIndexInSubCollection, previousOfPrevious, step;
    if (toFocus == null) {
      toFocus = null;
    }
    if (this.isReindexing) {
      return;
    }
    currentModel = this.views.findByModelCid(cid).model;
    previousIndexInSubCollection = this.collection.indexOf(currentModel) - 1;
    previous = this.collection.at(previousIndexInSubCollection);
    previousIndex = this.baseCollection.indexOf(previous);
    previousOfPrevious = this.baseCollection.at(previousIndex - 1) || null;
    if (previousIndex >= 0) {
      newOrder = this.baseCollection.getNewOrder(previousOfPrevious, previous);
      order = newOrder.order, step = newOrder.step;
      currentModel.set('order', order);
      currentModel.save();
      this.baseCollection.sort();
      this.taskModelCIDToFocus = toFocus != null ? toFocus : cid;
      this.render();
      return this.checkIfReindexationIsNeeded(step);
    }
  };

  TaskListView.prototype.onMoveDown = function(cid) {
    var currentModel, newOrder, next, nextIndex, nextIndexInSubCollection, nextOfNextModel, order, step;
    if (this.isReindexing) {
      return;
    }
    currentModel = this.views.findByModelCid(cid).model;
    nextIndexInSubCollection = this.collection.indexOf(currentModel) + 1;
    next = this.collection.at(nextIndexInSubCollection);
    nextIndex = this.baseCollection.indexOf(next);
    nextOfNextModel = this.baseCollection.at(nextIndex + 1) || null;
    if (nextIndex !== this.baseCollection.length && nextIndexInSubCollection !== this.collection.length) {
      newOrder = this.baseCollection.getNewOrder(next, nextOfNextModel);
      order = newOrder.order, step = newOrder.step;
      currentModel.set('order', order);
      currentModel.save();
      this.baseCollection.sort();
      this.taskModelCIDToFocus = typeof toFocus !== "undefined" && toFocus !== null ? toFocus : cid;
      this.render();
      return this.checkIfReindexationIsNeeded(step);
    }
  };

  TaskListView.prototype.updateArchiveButtonState = function() {
    if (this.collection.where({
      done: true
    }).length > 0) {
      return this.$('#archive-action').removeClass('disable');
    } else {
      return this.$('#archive-action').addClass('disable');
    }
  };

  TaskListView.prototype.onArchiveClicked = function() {
    var counterArchived, counterToArchive, done, tasksToArchive;
    if (this.isReindexing) {
      return;
    }
    tasksToArchive = this.collection.where({
      done: true
    });
    counterToArchive = tasksToArchive.length;
    counterArchived = 0;
    if (counterToArchive > 0) {
      this.$('#archive-action').html('&nbsp;');
      this.$('#archive-action').spin('tiny', '#fff');
    }
    done = (function(_this) {
      return function(task) {
        var taskView;
        counterArchived++;
        taskView = _this.views.findByModel(task);
        if (counterArchived === counterToArchive) {
          _this.stopListening(taskView);
          _this.views.remove(taskView);
          return taskView.$el.fadeOut(function() {
            taskView.destroy();
            _this.$('#archive-action').html(t('archive button'));
            return _this.trigger('archive-tasks', tasksToArchive);
          });
        } else {
          _this.stopListening(taskView);
          _this.views.remove(taskView);
          return taskView.$el.fadeOut(function() {
            return taskView.destroy();
          });
        }
      };
    })(this);
    return tasksToArchive.forEach(function(task) {
      task.set('isArchived', true);
      task.once('sync', done);
      return task.save();
    });
  };

  TaskListView.prototype.checkIfReindexationIsNeeded = function(step) {
    var maxThreshold, threshold;
    threshold = Math.pow(10, 8);
    maxThreshold = Number.MAX_VALUE / (this.baseCollection.length + 1);
    if (maxThreshold < threshold) {
      threshold = maxThreshold;
    }
    if (step <= threshold) {
      return this.baseCollection.reindex();
    }
  };

  return TaskListView;

})(BaseView);
});

;require.register("views/task_view", function(exports, require, module) {
var BaseView, TaskView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = TaskView = (function(_super) {
  __extends(TaskView, _super);

  function TaskView() {
    return TaskView.__super__.constructor.apply(this, arguments);
  }

  TaskView.prototype.tagName = 'li';

  TaskView.prototype.className = 'task';

  TaskView.prototype.template = require('./templates/task');

  TaskView.prototype.events = {
    'keydown  input': 'onKeydown',
    'keyup  input': 'onKeyup',
    'focus input': 'onFocus',
    'blur input': 'onBlur',
    'click button': 'onClick',
    'mouseenter button': 'onMouseEnter',
    'mouseleave button': 'onMouseLeave'
  };

  TaskView.prototype.getRenderData = function() {
    return {
      model: this.model.toJSON(),
      tabindex: this.model.collection.indexOf(this.model) + 2
    };
  };

  TaskView.prototype.afterRender = function() {
    if (this.model.get('done')) {
      this.$el.addClass('done');
      return this.$('button').html(t('done button'));
    } else {
      return this.$el.removeClass('done');
    }
  };

  TaskView.prototype.onClick = function() {
    this.model.set('done', !this.model.get('done'));
    if (this.model.get('done')) {
      this.model.set('completionDate', Date.now());
    } else {
      this.model.set('completionDate', null);
    }
    this.afterRender();
    this.model.save();
    return this.render();
  };

  TaskView.prototype.onKeydown = function(event) {
    var ctrlPressed, key;
    key = event.keyCode || event.charCode;
    ctrlPressed = event.controlKey || event.metaKey;
    if (this.$('input').val() === "" && key === 8) {
      this.model.destroy();
      event.preventDefault();
    } else if (key === 38 && ctrlPressed) {
      this.trigger('move-up', this.model.cid);
    } else if (key === 40 && ctrlPressed) {
      this.trigger('move-down', this.model.cid);
    }
    this.stopPerdiodicSave();
    return this.startPeriodicSave();
  };

  TaskView.prototype.onKeyup = function(event) {
    var key;
    key = event.keyCode || event.charCode;
    if (key === 13) {
      this.onBlur();
      return this.trigger('new-task-submitted', {
        content: '',
        previous: this.model.cid
      });
    } else if (key === 38) {
      return this.trigger('focus-up', this.model.cid);
    } else if (key === 40) {
      return this.trigger('focus-down', this.model.cid);
    }
  };

  TaskView.prototype.onFocus = function() {
    return this.startPeriodicSave();
  };

  TaskView.prototype.onBlur = function() {
    this.stopPerdiodicSave();
    return this.saveDescription();
  };

  TaskView.prototype.startPeriodicSave = function() {
    return this.focusInterval = setInterval((function(_this) {
      return function() {
        if (_this.$('input').val() !== "") {
          return _this.saveDescription();
        }
      };
    })(this), 2000);
  };

  TaskView.prototype.stopPerdiodicSave = function() {
    return clearInterval(this.focusInterval);
  };

  TaskView.prototype.saveDescription = function() {
    var description;
    description = this.$('input').val();
    if (description !== this.model.get('description')) {
      this.model.set('description', description);
      return this.model.save();
    }
  };

  TaskView.prototype.setFocus = function() {
    var index, inputField;
    inputField = this.$('input');
    inputField.focus();
    index = inputField.val().length;
    return inputField[0].setSelectionRange(index, index);
  };

  TaskView.prototype.onMouseEnter = function() {
    var button;
    button = this.$('button');
    if (this.model.get('done')) {
      button.attr('title', t('todo button?'));
      return button.html(t('todo button?'));
    } else {
      button.attr('title', t('done button?'));
      return button.html(t('done button?'));
    }
  };

  TaskView.prototype.onMouseLeave = function() {
    var button;
    button = this.$('button');
    if (this.model.get('done')) {
      return button.html(t('done button'));
    } else {
      return button.html(t('todo button'));
    }
  };

  TaskView.prototype.destroy = function() {
    clearTimeout(this.focusInterval);
    return TaskView.__super__.destroy.call(this);
  };

  return TaskView;

})(BaseView);
});

;require.register("views/templates/home", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"menu\"></div><div class=\"container\"></div><div id=\"block\"></div><div id=\"modal\"><p>" + (jade.escape(null == (jade_interp = t('reindexing message')) ? "" : jade_interp)) + "</p></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/menu", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),allCount = locals_.allCount,archivedCount = locals_.archivedCount;
buf.push("<ul><li id=\"tobedone\" class=\"first-level\"><a href=\"#\">" + (jade.escape((jade_interp = t('todo')) == null ? '' : jade_interp)) + " (" + (jade.escape((jade_interp = allCount) == null ? '' : jade_interp)) + ")</a><ul class=\"submenu\"></ul></li><li id=\"archived\" class=\"first-level\"><a href=\"#archived\">" + (jade.escape((jade_interp = t('archived')) == null ? '' : jade_interp)) + " (" + (jade.escape((jade_interp = archivedCount) == null ? '' : jade_interp)) + ")</a><ul class=\"submenu\"></ul></li></ul>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/menu_item", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),url = locals_.url,model = locals_.model;
buf.push("<a" + (jade.attr("href", "" + (url) + "", true, false)) + (jade.attr("title", "" + (model.tagName) + "", true, false)) + "><i class=\"tag-icon\"></i><span>" + (jade.escape((jade_interp = model.tagName) == null ? '' : jade_interp)) + " (" + (jade.escape((jade_interp = model.count) == null ? '' : jade_interp)) + ")</span></a><ul class=\"submenu\"></ul>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/task", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),model = locals_.model,tabindex = locals_.tabindex;
buf.push("<div class=\"task-container\"><button title=\"t('todo button')\" class=\"toggle-state button\">" + (jade.escape(null == (jade_interp = t('todo button')) ? "" : jade_interp)) + "</button><div class=\"todo-field\"><input" + (jade.attr("value", "" + (model.description) + "", true, false)) + (jade.attr("tabindex", "" + (tabindex) + "", true, false)) + "/></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/task_archive", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),model = locals_.model,tabindex = locals_.tabindex,competionDate = locals_.competionDate;
buf.push("<div class=\"task-container\"><button" + (jade.attr("title", "" + (t('done button')) + "", true, false)) + " class=\"toggle-state button\">" + (jade.escape(null == (jade_interp = t('done button')) ? "" : jade_interp)) + "</button><div class=\"todo-field\"><input" + (jade.attr("value", "" + (model.description) + "", true, false)) + (jade.attr("tabindex", "" + (tabindex) + "", true, false)) + "/></div></div><div class=\"todo-completionDate\"><p>" + (jade.escape((jade_interp = t('completed headline')) == null ? '' : jade_interp)) + " " + (jade.escape((jade_interp = competionDate) == null ? '' : jade_interp)) + "</p></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/task_form", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),formPlaceholder = locals_.formPlaceholder;
buf.push("<div class=\"task-container\"><button class=\"toggle-state button disabled\">" + (jade.escape(null == (jade_interp = t('new button')) ? "" : jade_interp)) + "</button><div class=\"todo-field\"><input tabindex=\"1\"" + (jade.attr("placeholder", "" + (formPlaceholder) + "", true, false)) + "/></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/task_list", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<h1 id=\"breadcrumb\"></h1><p id=\"actions\">" + (jade.escape((jade_interp = t('actions headline')) == null ? '' : jade_interp)) + ":<button id=\"archive-action\" class=\"button disable\">" + (jade.escape(null == (jade_interp = t('archive button')) ? "" : jade_interp)) + "</button></p><div id=\"new-task\" class=\"task\"></div><ul id=\"task-list\"></ul>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/task_list_archive", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),title = locals_.title;
buf.push("<h1>" + (jade.escape((jade_interp = title) == null ? '' : jade_interp)) + "</h1><ul id=\"task-list\"></ul>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;
//# sourceMappingURL=app.js.map