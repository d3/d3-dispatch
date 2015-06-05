export default function() {
  return new Dispatch(arguments);
};

function Dispatch(types) {
  var i = -1,
      n = types.length,
      typeByName = new Map,
      type,
      typeName,
      that = this;

  that.on = function(type, listener) {
    var i = (type += "").indexOf("."), name = "";

    // Extract optional name, e.g., "foo" in "click.foo".
    if (i >= 0) name = type.slice(i + 1), type = type.slice(0, i);

    // If a type was specified, set or get the listener as appropriate.
    if (type) return type = typeByName.get(type), arguments.length < 2 ? type.on(name) : (type.on(name, listener), that);

    // Otherwise, if a null listener was specified, remove all listeners with the given name.
    // Otherwise, ignore! Can’t add or return untyped listeners.
    if (arguments.length === 2) {
      if (listener == null) typeByName.forEach(function(type) { type.on(name, null) });
      return that;
    }
  };

  while (++i < n) {
    typeName = types[i] + "";
    if (typeName in that) throw new Error("illegal or duplicate type: " + typeName);
    type = new Type;
    typeByName.set(typeName, type);
    that[typeName] = dispatchOf(type);
  }

  function dispatchOf(type) {
    return function() {
      type.dispatch(this, arguments);
      return that;
    };
  }
}

function Type() {
  this.listeners = [];
  this.listenerByName = new Map;
}

Type.prototype = {
  dispatch: function(target, args) {
    var z = this.listeners, // Defensive reference; copy-on-remove.
        i = -1,
        n = z.length,
        l;
    while (++i < n) {
      if (l = z[i].value) {
        l.apply(target, args);
      }
    }
  },
  on: function(name, listener) {
    var listeners = this.listeners,
        listenerByName = this.listenerByName,
        l = listenerByName.get(name += ""),
        i;

    // return the current listener, if any
    if (arguments.length < 2) return l && l.value;

    // Remove the old listener, if any, using copy-on-remove.
    if (l) {
      l.value = null;
      this.listeners = listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
      listenerByName.delete(name);
    }

    // Add the new listener, if any.
    if (listener) {
      listener = {value: listener};
      listenerByName.set(name, listener);
      listeners.push(listener);
    }
  }
};
