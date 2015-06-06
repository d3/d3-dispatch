function dispatch() {
  return new Dispatch(arguments);
}

function Dispatch(types) {
  var i = -1,
      n = types.length,
      callbacksByType = new Map,
      callbackByName = new Map,
      type,
      that = this;

  that.once = function(type, callback) {
    type = parseType(type);
    that.on(type.name, callback);
    callbackByName.get(type.name).once = true;
    return that;
  };

  that.on = function(type, callback) {
    type = parseType(type);

    // Return the current callback, if any.
    if (arguments.length < 2) {
      return (callback = callbackByName.get(type.name)) && callback.value;
    }

    // If a type was specified…
    if (type.type) {
      var callbacks = callbacksByType.get(type.type),
          callback0 = callbackByName.get(type.name),
          i;

      // Remove the current callback, if any, using copy-on-remove.
      if (callback0) {
        callback0.value = null;
        i = callbacks.indexOf(callback0);
        callbacksByType.set(type.type, callbacks = callbacks.slice(0, i).concat(callbacks.slice(i + 1)));
        callbackByName.delete(type.name);
      }

      // Add the new callback, if any.
      if (callback) {
        callback = {name: type.name, value: callback, once: false};
        callbackByName.set(type.name, callback);
        callbacks.push(callback);
      }
    }

    // Otherwise, if a null callback was specified, remove all callbacks with the given name.
    else if (callback == null) {
      callbacksByType.forEach(function(callbacks, otherType) {
        if (callback = callbackByName.get(otherType + type.name)) {
          callback.value = null;
          var i = callbacks.indexOf(callback);
          callbacksByType.set(otherType, callbacks.slice(0, i).concat(callbacks.slice(i + 1)));
          callbackByName.delete(callback.name);
        }
      });
    }

    return that;
  };

  while (++i < n) {
    type = types[i] + "";
    if (type in that) throw new Error("illegal or duplicate type: " + type);
    callbacksByType.set(type, []);
    that[type] = applier(type);
  }

  function parseType(type) {
    var i = (type += "").indexOf("."), name = type;
    if (i >= 0) type = type.slice(0, i); else name += ".";
    if (type && !callbacksByType.has(type)) throw new Error("unknown type: " + type);
    return {type: type, name: name};
  }

  function applier(type) {
    return function() {
      var callbacks = callbacksByType.get(type), // Defensive reference; copy-on-remove.
          callback,
          callbackValue,
          i = -1,
          n = callbacks.length;

      while (++i < n) {
        if (callbackValue = (callback = callbacks[i]).value) {
          if (callback.once) that.on(callback.name, null);
          callbackValue.apply(this, arguments);
        }
      }

      return that;
    };
  }
}

dispatch.prototype = Dispatch.prototype; // allow instanceof

export default dispatch;
