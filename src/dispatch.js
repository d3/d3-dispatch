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

dispatch.prototype = Dispatch.prototype = {
  on: function(typename, callback) {
    var t = typename + "", name = "", i = t.indexOf("."), _ = this._;
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !this._.hasOwnProperty(t)) throw new Error("unknown type: " + typename);
    if (arguments.length < 2) return t ? get(_[t], name) : undefined;
    if (t) _[t] = set(_[t], name, callback);
    else if (callback == null) for (t in _) _[t] = set(_[t], name, null);
    return this;
  },
  call: function(type, that) {
    this.apply(type, that, slice.call(arguments, 2));
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var callbacks = this._[type], i = 0, n = callbacks.length, c; i < n; ++i) {
      if (c = callbacks[i].value) {
        c.apply(that, args);
      }
    }
  }
};

function get(callbacks, name) {
  for (var i = 0, n = callbacks.length, c; i < n; ++i) {
    if ((c = callbacks[i]).name === name) {
      return c.value;
    }
  }
}

function set(callbacks, name, callback) {
  for (var i = 0, n = callbacks.length, c; i < n; ++i) {
    if ((c = callbacks[i]).name === name) {
      callbacks = callbacks.slice(0, i).concat(callbacks.slice(i + 1));
      c.value = null;
      break;
    }
  }
  if (callback != null) callbacks.push({name: name, value: callback});
  return callbacks;
}

export default dispatch;
