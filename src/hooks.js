// Hooks.js 0.1.0
// _Deeply_ inspired by the WordPress plugin hooks.

// Sets up a storage object for our actions and filters.
// The difference between this is that filters always return a value.
var storage = {
  actions: {},
  filters: {}
};

// Hook Functions
// --------------

// Add a new hook to the storage object.
function addHook(type, hook, functionToAdd, priority) {
  // Sanitize priority to be an integer.
  priority = parseInt(priority, 10);

  if (! (hook in storage[type])) {
    storage[type][hook] = {};
  }

  if (! (priority in storage[type][hook])) {
    storage[type][hook][priority] = [];
  }

  storage[type][hook][priority].push(functionToAdd);

  return storage[type];
}

function doHook(type, hook, args) {
  var value = args[0];
  if (! (hook in storage[type])) {
    return value;
  }

  for (var priority in storage[type][hook]) {
    // Using the native forEach is NBD.
    // http://kangax.github.io/compat-table/es5/#Array.prototype.forEach
    storage[type][hook][priority].forEach(function (callback, index) {
      if (typeof callback !== 'function') {
        return;
      }

      value = callback.apply(this, args);

      // Keep track of the value for filters.
      if (type === 'filters') {
        args[0] = value;
      }
    });
  }

  // Remove all hooks.
  storage[type][hook] = {};

  return value;
}

// Check if a hook exists in the storage object.
// Caveat: Doesn't work for closures.
function hasHook(type, hook, functionToCheck) {
  var hookExists = false;

  if (! (hook in storage[type])) {
    return hookExists;
  }

  for (var priority in storage[type][hook]) {
    if (hookExists) {
      break;
    }

    for (var key in storage[type][hook][priority]) {
      if (storage[type][hook][priority][key] !== functionToCheck) {
        continue;
      }

      hookExists = true;
      break;
    }

  }

  return hookExists;
}

// Remove a hook from the storage object.
function removeHook(type, hook, functionToRemove, priority) {
  var isRemoved = false;

  if (! (hook in storage[type])) {
    return isRemoved;
  }

  if (! (priority in storage[type][hook])) {
    return isRemoved;
  }

  var index = storage[type][hook][priority].indexOf(functionToRemove);

  if (index === -1) {
    return isRemoved;
  }

  storage[type][hook][priority].splice(index, 1);
  isRemove = true;

  return isRemoved;
}

// Remove all hooks for a hook.
function removeAllHooks(type, hook, priority) {
  var isRemoved = false;

  if (! (hook in storage[type])) {
    return isRemoved;
  }

  if (! priority) {
    storage[type][hook] = {};
    isRemoved = true;
  } else {
    if (! (priority in storage[type][hook])) {
      return isRemoved;
    }

    storage[type][hook][priority] = [];
    isRemoved = true;
  }

  return isRemoved;
}

// Create the Hooks module object to export.
var Hooks = {

  // Action Functions
  // ----------------

  addAction: function (action, functionToAdd, priority) {
    priority = priority || 10;
    addHook('actions', action, functionToAdd, priority);
  },

  doAction: function () {
    var args = Array.prototype.slice.call(arguments),
      action = args.shift();

    return doHook('actions', action, args);
  },

  hasAction: function (action, functionToCheck) {
    return hasHook('actions', action, functionToCheck);
  },

  removeAction: function (action, functionToRemove, priority) {
    return removeHook('actions', action, functionToRemove, priority);
  },

  removeAllActions: function (action, priority) {
    priority = priority || false;
    return removeAllHooks('actions', action, priority);
  },

  // Filter Functions
  // ----------------

  addFilter: function (filter, functionToAdd, priority) {
    priority = priority || 10;
    addHook('filters', filter, functionToAdd, priority);
  },

  hasFilter: function (filter, functionToCheck) {
    return hasHook('filters', filter, functionToCheck);
  },

  applyFilters: function () {
    var args = Array.prototype.slice.call(arguments),
      filter = args.shift();

    return doHook('filters', filter, args);
  },

  removeFilter: function (filter, functionToRemove, priority) {
    return removeHook('filters', filter, functionToRemove, priority);
  },

  removeAllFilters: function (filter, priority) {
    priority = priority || false;
    return removeAllHooks('filters', filter, priority);
  }

};

// Export the Hooks object only.
// Keeps the storage object safe.
export default Hooks;