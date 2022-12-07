function getPath(path, currentPath) {
  if (path === undefined) {
    throw new Error(`path was undefined`);
  }
  const newPath = currentPath ? `${path.key}:${currentPath}` : String(path.key);
  if (!path.prev) {
    return newPath;
  }
  return getPath(path.prev, newPath);
}

function findLongestPrefix(target, prefixes) {
  let match;
  let matchLength = 0;
  for (const prefix of prefixes) {
    if (target.startsWith(prefix)) {
      const length = prefix.length;
      if (length > matchLength) {
        match = prefix;
        matchLength = length;
      }
    }
  }
  return match;
}

class CascadedContext {
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
  cascadeMap = new Map();
  reporter = null;

  constructor({ reporter }) {
    this.reporter = reporter;
  }

  set(info, value) {
    if (!info.path) {
      return;
    }

    const path = getPath(info.path);
    this.cascadeMap.set(path, value);
  }

  get(info) {
    if (!info.path) {
      return null;
    }

    const path = getPath(info.path);
    const cascadeKeys = [...this.cascadeMap.keys()];
    const lastCascade = findLongestPrefix(path, cascadeKeys);

    if (lastCascade) {
      // Since we pulled this out of the cascade keys,
      // there is always a T for this key
      return this.cascadeMap.get(lastCascade);
    }

    return null;
  }

  clear(info) {
    if (!info.path) {
      return null;
    }

    const path = getPath(info.path);

    for (const key of this.cascadeMap.keys()) {
      if (key === path || key.startsWith(`${path}:`)) {
        this.cascadeMap.delete(key);
      }
    }
  }
}

module.exports = CascadedContext;
