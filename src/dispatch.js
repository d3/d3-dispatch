function dispatch() {
  return new Dispatch(arguments);
}

function Dispatch(types) {
  var i = -1,
      n = types.length,
      typeByName = new Map,
      type,
      typeName,
      that = this;

  that.once = function(type, callback) {
    type = parseType(type);
    type.type.on(type.name, callback).once = true;
    return that;
  };

  that.on = function(type, callback) {
    type = parseType(type);

    // If a type was specified, set or get the callback as appropriate.
    if (type.type) return arguments.length < 2
        ? type.type.on(type.name)
        : (type.type.on(type.name, callback), that);

    // Otherwise, if a null callback was specified, remove all callbacks with the given name.
    // Otherwise, ignore! Can’t add or return untyped callbacks.
    if (arguments.length === 2) {
      if (callback == null) {
        typeByName.forEach(function(t) {
          t.on(type.name, null);
        });
      }
      return that;
    }
  };

  while (++i < n) {
    typeName = types[i] + "";
    if (typeName in that) throw new Error("illegal or duplicate type: " + typeName);
    type = new Type;
    typeByName.set(typeName, type);
    that[typeName] = applyOf(type);
  }

  // Extract optional name, e.g., "foo" in "click.foo".
  function parseType(type) {
    var i = (type += "").indexOf("."), name = "";
    if (i >= 0) name = type.slice(i + 1), type = type.slice(0, i);
    if (type && !(type = typeByName.get(type))) throw new Error("unknown type: " + type);
    return {type: type, name: name};
  }

  function applyOf(type) {
    return function() {
      type.apply(this, arguments);
      return that;
    };
  }
}

dispatch.prototype = Dispatch.prototype; // allow instanceof

function Type() {
  this.callbacks = [];
  this.callbackByName = new Map;
}

Type.prototype = {
  apply: function(that, args) {
    var callbacks = this.callbacks, // Defensive reference; copy-on-remove.
        callback,
        callbackValue,
        i = -1,
        n = callbacks.length;
    while (++i < n) {
      if (callbackValue = (callback = callbacks[i]).value) {
        if (callback.once) this.on(callback.name, null);
        callbackValue.apply(that, args);
      }
    }
  },
  on: function(name, value) {
    var callback0 = this.callbackByName.get(name),
        callback,
        i;

    // Return the current callback, if any.
    if (arguments.length < 2) return callback0 && callback0.value;

    // Remove the current callback, if any, using copy-on-remove.
    if (callback0) {
      callback0.value = null;
      i = this.callbacks.indexOf(callback0);
      this.callbacks = this.callbacks.slice(0, i).concat(this.callbacks.slice(i + 1));
      this.callbackByName.delete(name);
    }

    // Add the new callback, if any.
    if (value) {
      callback = {name: name, value: value, once: false};
      this.callbackByName.set(name, callback);
      this.callbacks.push(callback);
      return callback;
    }
  }
};

export default dispatch;
