# d3-dispatch

Register named callbacks and call them with arguments. Dispatching is a convenient mechanism for separating concerns with loosely-coupled code. A variety of D3 components, such as [d3-xhr](https://github.com/d3/d3-xhr), use d3-dispatch to emit events. Think of this like Node’s [EventEmitter](https://nodejs.org/api/events.html), except every listener has a well-defined name so it’s easy to remove or replace them.

[![dispatching events](http://bl.ocks.org/mbostock/raw/5872848/thumbnail.png)](http://bl.ocks.org/mbostock/5872848)

Changes from D3 3.x:

* It is now an error to attempt to register a callback type that: conflicts with a built-in property on all objects, such as `__proto__` or `hasOwnProperty`; conflicts with a built-in method on dispatch (e.g., `on`);  conflicts with another type on the same dispatch (e.g., `dispatch("foo", "foo")`); is the empty string.

* The exposed [*dispatch*.*type*](#type) field is now strictly a method for invoking callbacks. Use `dispatch.on(type, …)` to get or set callbacks, rather than `dispatch[type].on(…)`.

* The `instanceof` operator now works as expected with dispatch objects.

<a name="dispatch" href="#dispatch">#</a> <b>dispatch</b>(<i>types…</i>)

Creates a new dispatch object for the specified *types*. Each *type* is a string representing the name of a callback type, such as `"zoom"` or `"change"`; for each type, a method is exposed on the returned dispatch object for invoking the callbacks of that type.

For example, if you create a dispatch for `"start"` and `"end"` callbacks:

```js
var dispatcher = dispatch("start", "end");
```

You can then register callbacks for the different types using [*dispatch*.on](#on):

```js
dispatcher.on("start", callback1);
dispatcher.on("start.foo", callback2);
dispatcher.on("end", callback3);
```

Lastly, you can invoke any `"start"` callbacks using [*dispatch*.*type*](#type):

```js
dispatcher.start("pass arguments to callbacks here");
```

<a name="on" href="#on">#</a> *dispatch*.<b>on</b>(<i>type</i>[, <i>callback</i>])

Adds, removes or gets an *callback* of the specified *type*.

The *type* is a string, such as `"start"` or `"end"`. To register multiple callbacks for the same type, the type may be followed by an optional namespace, such as `"start.foo"` and `"start.bar"`. You can remove all registered callbacks for a given namespace by saying `dispatch.on(".foo", null)`.

If a *callback* is specified, it is registered for the specified *type*. If a callback was already registered for the same type, the existing callback is removed before the new callback is added. If *callback* is not specified, returns the current callback for the specified *type*, if any. The specified *callback* is invoked with the context and arguments specified by the caller; see [*dispatch*.*type*](#type).

<a name="type" href="#type">#</a> *dispatch*.<b>*type*</b>(<i>arguments…</i>)

The *type* method (such as `dispatch.start` for the `"start"` type) invokes each registered callback for the specified type, passing the callback the specified *arguments*. The `this` context will be used as the context of the registered callbacks.

For example, if you wanted to dispatch your `"custom"` callbacks after receiving a native `"click"` event, while preserving the current `this` context and arguments, you could say:

```js
selection.on("click", function() {
  dispatch.custom.apply(this, arguments);
});
```

You can pass whatever arguments you want to callbacks; most commonly, you might create an object that represents an event, or pass the current datum (*d*) and index (*i*). See [function.call](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/Call) and [function.apply](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/Apply) for further information.
