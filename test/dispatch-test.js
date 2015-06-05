var tape = require("tape"),
    dispatch = require("../");

tape("dispatch(type…) returns an object with the specified types", function(test) {
  var d = dispatch("foo", "bar");
  test.equal(typeof d.foo, "function");
  test.equal(typeof d.bar, "function");
  test.end();
});

tape("dispatch(type…) throws an error if a specified type name is illegal", function(test) {
  test.throws(function() { dispatch("__proto__"); });
  test.throws(function() { dispatch("hasOwnProperty"); });
  test.throws(function() { dispatch("on"); });
  test.end();
});

tape("dispatch(type…) throws an error if a specified type name is a duplicate", function(test) {
  test.throws(function() { dispatch("foo", "foo"); });
  test.end();
});

tape("dispatch(type)[type](…) invokes callbacks of the specified type", function(test) {
  var foo = 0,
      bar = 0,
      d = dispatch("foo", "bar").on("foo", function() { ++foo; }).on("bar", function() { ++bar; });
  d.foo();
  test.equal(foo, 1);
  test.equal(bar, 0);
  d.foo();
  d.bar();
  test.equal(foo, 2);
  test.equal(bar, 1);
  test.end();
});

tape("dispatch(type)[type](…) invokes callbacks with specified arguments and context", function(test) {
  var results = [],
      foo = {},
      bar = {},
      d = dispatch("foo").on("foo", function() { results.push({this: this, arguments: [].slice.call(arguments)}); });
  d.foo.call(foo, bar);
  test.deepEqual(results, [{this: foo, arguments: [bar]}]);
  d.foo.call(bar, foo, 42, "baz");
  test.deepEqual(results, [{this: foo, arguments: [bar]}, {this: bar, arguments: [foo, 42, "baz"]}]);
  test.end();
});

tape("dispatch(type).on(type, f) replaces an existing listener, if present", function(test) {
  var foo = 0,
      bar = 0,
      d = dispatch("foo", "bar");
  d.on("foo", function() { ++foo; });
  d.foo();
  test.equal(foo, 1);
  test.equal(bar, 0);
  d.on("foo", function() { ++bar; });
  d.foo();
  test.equal(foo, 1);
  test.equal(bar, 1);
  test.end();
});

tape("dispatch(type).on(type, null) removes an existing listener, if present", function(test) {
  var foo = 0,
      d = dispatch("foo", "bar");
  d.on("foo", function() { ++foo; });
  d.foo();
  test.equal(foo, 1);
  d.on("foo", null);
  d.foo();
  test.equal(foo, 1);
  test.end();
});
