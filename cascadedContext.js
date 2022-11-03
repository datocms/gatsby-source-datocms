'use strict';

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError(
    'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
  );
}

function _iterableToArray(iter) {
  if (
    (typeof Symbol !== 'undefined' && iter[Symbol.iterator] != null) ||
    iter['@@iterator'] != null
  )
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it =
    (typeof Symbol !== 'undefined' && o[Symbol.iterator]) || o['@@iterator'];
  if (!it) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it;
      var i = 0;
      var F = function F() {};
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        },
        e: function e(_e) {
          throw _e;
        },
        f: F,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
    );
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function s() {
      it = it.call(o);
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it['return'] != null) it['return']();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

function getPath(path, currentPath) {
  if (path === undefined) {
    throw new Error('path was undefined');
  }

  var newPath = currentPath
    ? ''.concat(path.key, ':').concat(currentPath)
    : String(path.key);

  if (!path.prev) {
    return newPath;
  }

  return getPath(path.prev, newPath);
}

function findLongestPrefix(target, prefixes) {
  var match;
  var matchLength = 0;

  var _iterator = _createForOfIteratorHelper(prefixes),
    _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var prefix = _step.value;

      if (target.startsWith(prefix)) {
        var length = prefix.length;

        if (length > matchLength) {
          match = prefix;
          matchLength = length;
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return match;
}

var CascadedContext = /*#__PURE__*/ (function() {
  /*
    Stores a value by prefix like
    a:b       : true
    a:b:c:d   : false
    a:b:c:d:e : true
    the prefix is determined by walking the `info.path` property
    and concatenating it by `:`
    By finding the longest matching prefix for a given other path,
    we can determine the current state of the variable for that part of the cascade
  */
  function CascadedContext(_ref) {
    var reporter = _ref.reporter;

    _classCallCheck(this, CascadedContext);

    _defineProperty(this, 'cascadeMap', new Map());

    _defineProperty(this, 'reporter', null);

    this.reporter = reporter;
  }

  _createClass(CascadedContext, [
    {
      key: 'set',
      value: function set(info, value) {
        if (!info.path) {
          return;
        }

        var path = getPath(info.path);
        this.cascadeMap.set(path, value);
      },
    },
    {
      key: 'get',
      value: function get(info) {
        if (!info.path) {
          return null;
        }

        var path = getPath(info.path);

        var cascadeKeys = _toConsumableArray(this.cascadeMap.keys());

        var lastCascade = findLongestPrefix(path, cascadeKeys);

        if (lastCascade) {
          // Since we pulled this out of the cascade keys,
          // there is always a T for this key
          this.reporter.verbose(
            'found this active locale from context:',
            this.cascadeMap.get(lastCascade),
          );
          return this.cascadeMap.get(lastCascade);
        }

        this.reporter.verbose('fallback to default locale');
        return null;
      },
    },
    {
      key: 'clear',
      value: function clear(info) {
        if (!info.path) {
          return null;
        }

        var path = getPath(info.path);

        var _iterator2 = _createForOfIteratorHelper(this.cascadeMap.keys()),
          _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
            var key = _step2.value;

            if (key === path || key.startsWith(''.concat(path, ':'))) {
              this.cascadeMap['delete'](key);
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      },
    },
  ]);

  return CascadedContext;
})();

module.exports = CascadedContext;
