# d3-dispatch

Register named callbacks and call them with arguments. This code is currently EXPERIMENTAL and represents the in-development D3 4.0 API. The 4.0 API is largely backwards-compatible, but differs from 3.x in several ways:

* It is now an error to attempt to register an event type name that: conflicts with a built-in property on all objects, such as `__proto__` or `hasOwnProperty`; conflicts with a built-in method on dispatch (namely, `on`); conflicts with another event type on the same dispatch (e.g., `dispatch("foo", "foo")`).
