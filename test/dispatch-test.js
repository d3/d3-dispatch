import assert from "assert";
import * as d3 from "../src/index.js";

it("dispatch(type…) returns a dispatch object with the specified types", () => {
  var d = d3.dispatch("foo", "bar");
  assert(d instanceof d3.dispatch);
});

it("dispatch(type…) does not throw an error if a specified type name collides with a dispatch method", () => {
  var d = d3.dispatch("on");
  assert(d instanceof d3.dispatch);
});

it("dispatch(type…) throws an error if a specified type name is illegal", () => {
  assert.throws(function() { d3.dispatch("__proto__"); });
  assert.throws(function() { d3.dispatch("hasOwnProperty"); });
  assert.throws(function() { d3.dispatch(""); });
  assert.throws(function() { d3.dispatch("foo.bar"); });
  assert.throws(function() { d3.dispatch("foo bar"); });
  assert.throws(function() { d3.dispatch("foo\tbar"); });
});

it("dispatch(type…) throws an error if a specified type name is a duplicate", () => {
  assert.throws(function() { d3.dispatch("foo", "foo"); });
});

it("dispatch(type).call(type, object, arguments…) invokes callbacks of the specified type", () => {
  var foo = 0,
      bar = 0,
      d = d3.dispatch("foo", "bar").on("foo", function() { ++foo; }).on("bar", function() { ++bar; });
  d.call("foo");
  assert.equal(foo, 1);
  assert.equal(bar, 0);
  d.call("foo");
  d.call("bar");
  assert.equal(foo, 2);
  assert.equal(bar, 1);
});

it("dispatch(type).call(type, object, arguments…) invokes callbacks with specified arguments and context", () => {
  var results = [],
      foo = {},
      bar = {},
      d = d3.dispatch("foo").on("foo", function() { results.push({this: this, arguments: [].slice.call(arguments)}); });
  d.call("foo", foo, bar);
  assert.deepEqual(results, [{this: foo, arguments: [bar]}]);
  d.call("foo", bar, foo, 42, "baz");
  assert.deepEqual(results, [{this: foo, arguments: [bar]}, {this: bar, arguments: [foo, 42, "baz"]}]);
});

it("dispatch(type).call(type, object, arguments…) invokes callbacks in the order they were added", () => {
  var results = [],
      d = d3.dispatch("foo");
  d.on("foo.a", function() { results.push("A"); });
  d.on("foo.b", function() { results.push("B"); });
  d.call("foo");
  d.on("foo.c", function() { results.push("C"); });
  d.on("foo.a", function() { results.push("A"); }); // move to end
  d.call("foo");
  assert.deepEqual(results, ["A", "B", "B", "C", "A"]);
});

it("dispatch(type).call(type, object, arguments…) returns undefined", () => {
  var d = d3.dispatch("foo");
  assert.equal(d.call("foo"), undefined);
});

it("dispatch(type).apply(type, object, arguments) invokes callbacks of the specified type", () => {
  var foo = 0,
      bar = 0,
      d = d3.dispatch("foo", "bar").on("foo", function() { ++foo; }).on("bar", function() { ++bar; });
  d.apply("foo");
  assert.equal(foo, 1);
  assert.equal(bar, 0);
  d.apply("foo");
  d.apply("bar");
  assert.equal(foo, 2);
  assert.equal(bar, 1);
});

it("dispatch(type).apply(type, object, arguments) invokes callbacks with specified arguments and context", () => {
  var results = [],
      foo = {},
      bar = {},
      d = d3.dispatch("foo").on("foo", function() { results.push({this: this, arguments: [].slice.call(arguments)}); });
  d.apply("foo", foo, [bar]);
  assert.deepEqual(results, [{this: foo, arguments: [bar]}]);
  d.apply("foo", bar, [foo, 42, "baz"]);
  assert.deepEqual(results, [{this: foo, arguments: [bar]}, {this: bar, arguments: [foo, 42, "baz"]}]);
});

it("dispatch(type).apply(type, object, arguments) invokes callbacks in the order they were added", () => {
  var results = [],
      d = d3.dispatch("foo");
  d.on("foo.a", function() { results.push("A"); });
  d.on("foo.b", function() { results.push("B"); });
  d.apply("foo");
  d.on("foo.c", function() { results.push("C"); });
  d.on("foo.a", function() { results.push("A"); }); // move to end
  d.apply("foo");
  assert.deepEqual(results, ["A", "B", "B", "C", "A"]);
});

it("dispatch(type).apply(type, object, arguments) returns undefined", () => {
  var d = d3.dispatch("foo");
  assert.equal(d.apply("foo"), undefined);
});

it("dispatch(type).on(type, f) returns the dispatch object", () => {
  var d = d3.dispatch("foo");
  assert.equal(d.on("foo", function() {}), d);
});

it("dispatch(type).on(type, f) replaces an existing callback, if present", () => {
  var foo = 0,
      bar = 0,
      d = d3.dispatch("foo", "bar");
  d.on("foo", function() { ++foo; });
  d.call("foo");
  assert.equal(foo, 1);
  assert.equal(bar, 0);
  d.on("foo", function() { ++bar; });
  d.call("foo");
  assert.equal(foo, 1);
  assert.equal(bar, 1);
});

it("dispatch(type).on(type, f) replacing an existing callback with itself has no effect", () => {
  var foo = 0,
      FOO = function() { ++foo; },
      d = d3.dispatch("foo").on("foo", FOO);
  d.call("foo");
  assert.equal(foo, 1);
  d.on("foo", FOO).on("foo", FOO).on("foo", FOO);
  d.call("foo");
  assert.equal(foo, 2);
});

it("dispatch(type).on(type., …) is equivalent to dispatch(type).on(type, …)", () => {
  var d = d3.dispatch("foo"),
      foos = 0,
      bars = 0,
      foo = function() { ++foos; },
      bar = function() { ++bars; };
  assert.equal(d.on("foo.", foo), d);
  assert.equal(d.on("foo."), foo);
  assert.equal(d.on("foo"), foo);
  assert.equal(d.on("foo.", bar), d);
  assert.equal(d.on("foo."), bar);
  assert.equal(d.on("foo"), bar);
  assert.equal(d.call("foo"), undefined);
  assert.equal(foos, 0);
  assert.equal(bars, 1);
  assert.equal(d.on(".", null), d);
  assert.equal(d.on("foo"), undefined);
  assert.equal(d.call("foo"), undefined);
  assert.equal(foos, 0);
  assert.equal(bars, 1);
});

it("dispatch(type).on(type, null) removes an existing callback, if present", () => {
  var foo = 0,
      d = d3.dispatch("foo", "bar");
  d.on("foo", function() { ++foo; });
  d.call("foo");
  assert.equal(foo, 1);
  d.on("foo", null);
  d.call("foo");
  assert.equal(foo, 1);
});

it("dispatch(type).on(type, null) does not remove a shared callback", () => {
  var a = 0,
      A = function() { ++a; },
      d = d3.dispatch("foo", "bar").on("foo", A).on("bar", A);
  d.call("foo");
  d.call("bar");
  assert.equal(a, 2);
  d.on("foo", null);
  d.call("bar");
  assert.equal(a, 3);
});

it("dispatch(type).on(type, null) removing a missing callback has no effect", () => {
  var d = d3.dispatch("foo"), a = 0;
  function A() { ++a; }
  d.on("foo.a", null).on("foo", A).on("foo", null).on("foo", null);
  d.call("foo");
  assert.equal(a, 0);
});

it("dispatch(type).on(type, null) during a callback does not invoke the old callback", () => {
  var a = 0,
      b = 0,
      c = 0,
      A = function() { ++a; d.on("foo.B", null); }, // remove B
      B = function() { ++b; },
      d = d3.dispatch("foo").on("foo.A", A).on("foo.B", B);
  d.call("foo");
  assert.equal(a, 1);
  assert.equal(b, 0);
  assert.equal(c, 0);
});

it("dispatch(type).on(type, f) during a callback does not invoke the old or the new callback", () => {
  var a = 0,
      b = 0,
      c = 0,
      A = function() { ++a; d.on("foo.B", C); }, // replace B with C
      B = function() { ++b; },
      C = function() { ++c; },
      d = d3.dispatch("foo").on("foo.A", A).on("foo.B", B);
  d.call("foo");
  assert.equal(a, 1);
  assert.equal(b, 0);
  assert.equal(c, 0);
});

it("dispatch(type).on(type, f) during a callback does not invoke the new callback", () => {
  var a = 0,
      b = 0,
      A = function() { ++a; d.on("foo.B", B); }, // add B
      B = function() { ++b; },
      d = d3.dispatch("foo").on("foo.A", A);
  d.call("foo");
  assert.equal(a, 1);
  assert.equal(b, 0);
});

it("dispatch(type).on(type, f) coerces type to a string", () => {
  var f = function() {},
      g = function() {},
      d = d3.dispatch(null, undefined).on(null, f).on(undefined, g);
  assert.equal(d.on(null), f);
  assert.equal(d.on(undefined), g);
});

it("dispatch(\"foo\", \"bar\").on(\"foo bar\", f) adds a callback for both types", () => {
  var foos = 0,
      foo = function() { ++foos; },
      d = d3.dispatch("foo", "bar").on("foo bar", foo);
  assert.equal(d.on("foo"), foo);
  assert.equal(d.on("bar"), foo);
  d.call("foo");
  assert.equal(foos, 1);
  d.call("bar");
  assert.equal(foos, 2);
});

it("dispatch(\"foo\").on(\"foo.one foo.two\", f) adds a callback for both typenames", () => {
  var foos = 0,
      foo = function() { ++foos; },
      d = d3.dispatch("foo").on("foo.one foo.two", foo);
  assert.equal(d.on("foo.one"), foo);
  assert.equal(d.on("foo.two"), foo);
  d.call("foo");
  assert.equal(foos, 2);
});

it("dispatch(\"foo\", \"bar\").on(\"foo bar\") returns the callback for either type", () => {
  var foo = function() {},
      d = d3.dispatch("foo", "bar");
  d.on("foo", foo);
  assert.equal(d.on("foo bar"), foo);
  assert.equal(d.on("bar foo"), foo);
  d.on("foo", null).on("bar", foo);
  assert.equal(d.on("foo bar"), foo);
  assert.equal(d.on("bar foo"), foo);
});

it("dispatch(\"foo\").on(\"foo.one foo.two\") returns the callback for either typename", () => {
  var foo = function() {},
      d = d3.dispatch("foo");
  d.on("foo.one", foo);
  assert.equal(d.on("foo.one foo.two"), foo);
  assert.equal(d.on("foo.two foo.one"), foo);
  assert.equal(d.on("foo foo.one"), foo);
  assert.equal(d.on("foo.one foo"), foo);
  d.on("foo.one", null).on("foo.two", foo);
  assert.equal(d.on("foo.one foo.two"), foo);
  assert.equal(d.on("foo.two foo.one"), foo);
  assert.equal(d.on("foo foo.two"), foo);
  assert.equal(d.on("foo.two foo"), foo);
});

it("dispatch(\"foo\").on(\".one .two\", null) removes the callback for either typename", () => {
  var foo = function() {},
      d = d3.dispatch("foo");
  d.on("foo.one", foo);
  d.on("foo.two", foo);
  d.on("foo.one foo.two", null);
  assert.equal(d.on("foo.one"), undefined);
  assert.equal(d.on("foo.two"), undefined);
});

it("dispatch(type).on(type, f) throws an error if f is not a function", () => {
  assert.throws(function() { d3.dispatch("foo").on("foo", 42); });
});

it("dispatch(…).on(type, f) throws an error if the type is unknown", () => {
  assert.throws(function() { d3.dispatch("foo").on("bar", function() {}); });
  assert.throws(function() { d3.dispatch("foo").on("__proto__", function() {}); });
});

it("dispatch(…).on(type) throws an error if the type is unknown", () => {
  assert.throws(function() { d3.dispatch("foo").on("bar"); });
  assert.throws(function() { d3.dispatch("foo").on("__proto__"); });
});

it("dispatch(type).on(type) returns the expected callback", () => {
  var d = d3.dispatch("foo");
  function A() {}
  function B() {}
  function C() {}
  d.on("foo.a", A).on("foo.b", B).on("foo", C);
  assert.equal(d.on("foo.a"), A);
  assert.equal(d.on("foo.b"), B);
  assert.equal(d.on("foo"), C);
});

it("dispatch(type).on(.name) returns undefined when retrieving a callback", () => {
  var d = d3.dispatch("foo").on("foo.a", function() {});
  assert.equal(d.on(".a"), undefined);
});

it("dispatch(type).on(.name, null) removes all callbacks with the specified name", () => {
  var d = d3.dispatch("foo", "bar"), a = {}, b = {}, c = {}, those = [];
  function A() { those.push(a); }
  function B() { those.push(b); }
  function C() { those.push(c); }
  d.on("foo.a", A).on("bar.a", B).on("foo", C).on(".a", null);
  d.call("foo");
  d.call("bar");
  assert.deepEqual(those, [c]);
});

it("dispatch(type).on(.name, f) has no effect", () => {
  var d = d3.dispatch("foo", "bar"), a = {}, b = {}, those = [];
  function A() { those.push(a); }
  function B() { those.push(b); }
  d.on(".a", A).on("foo.a", B).on("bar", B);
  d.call("foo");
  d.call("bar");
  assert.deepEqual(those, [b, b]);
  assert.equal(d.on(".a"), undefined);
});

it("dispatch(type…).copy() returns an isolated copy", () => {
  var foo = function() {},
      bar = function() {},
      d0 = d3.dispatch("foo", "bar").on("foo", foo).on("bar", bar),
      d1 = d0.copy();
  assert.equal(d1.on("foo"), foo);
  assert.equal(d1.on("bar"), bar);

  // Changes to d1 don’t affect d0.
  assert.equal(d1.on("bar", null), d1);
  assert.equal(d1.on("bar"), undefined);
  assert.equal(d0.on("bar"), bar);

  // Changes to d0 don’t affect d1.
  assert.equal(d0.on("foo", null), d0);
  assert.equal(d0.on("foo"), undefined);
  assert.equal(d1.on("foo"), foo);
});
