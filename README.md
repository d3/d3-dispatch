# d3-dispatch

Dispatching is a convenient mechanism for separating concerns with loosely-coupled code: register named callbacks and then call them with arbitrary arguments. A variety of D3 components, such as [d3-request](https://github.com/d3/d3-request), use this mechanism to emit events to listeners. Think of this like Node’s [EventEmitter](https://nodejs.org/api/events.html), except every listener has a well-defined name so it’s easy to remove or replace them.

For example, if you create a dispatch for `"start"` and `"end"` callbacks:

```js
var dispatch = d3_dispatch.dispatch("start", "end");
```

You can then register callbacks for the different types using [*dispatch*.on](#on):

```js
dispatch.on("start", callback1);
dispatch.on("start.foo", callback2);
dispatch.on("end", callback3);
```

Then, you can invoke the `"start"` callbacks using [*dispatch*.*type*](#type):

```js
dispatch.start("pass arguments to callbacks here");
```

Want a more involved example? See how to use [d3-dispatch for coordinated views](http://bl.ocks.org/mbostock/5872848).

## Installing

If you use NPM, `npm install d3-dispatch`. Otherwise, download the [latest release](https://github.com/d3/d3-dispatch/releases/latest). The released bundle supports AMD, CommonJS, and vanilla environments. Create a custom build using [Rollup](https://github.com/rollup/rollup) or your preferred bundler. You can also load directly from [d3js.org](https://d3js.org):

```html
<script src="https://d3js.org/d3-dispatch.v0.2.min.js"></script>
```

In a vanilla environment, a `d3_dispatch` global is exported. [Try d3-dispatch in your browser.](https://tonicdev.com/npm/d3-dispatch)

## API Reference

<a name="dispatch" href="#dispatch">#</a> d3_dispatch.<b>dispatch</b>(<i>types…</i>)

Creates a new dispatch object for the specified *types*. Each *type* is a string representing the name of a callback type, such as `"zoom"` or `"change"`; for each type, a method is exposed on the returned dispatch object for invoking the callbacks of that type.

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
