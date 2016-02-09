var slice = Array.prototype.slice;

function dispatch() {
  return new Dispatch(arguments);
}

function Dispatch(typenames) {
  for (var i = 0, n = typenames.length, _ = this._ = {}, t; i < n; ++i) {
    if (!(t = typenames[i] + "") || (t in _)) throw new Error("illegal or duplicate type: " + t);
    _[t] = [];
  }
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

dispatch.prototype = Dispatch.prototype = {
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }

    return this;
  },
  call: function(type, that) {
    this.apply(type, that, slice.call(arguments, 2));
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length, c; i < n; ++i) {
      if (c = t[i].value) {
        c.apply(that, args);
      }
    }
  }
};

function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set(type, name, callback) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      type = type.slice(0, i).concat(type.slice(i + 1));
      c.value = null;
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

export default dispatch;
