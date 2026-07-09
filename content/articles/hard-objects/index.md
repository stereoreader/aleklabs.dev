---
date: 2026-07-06
slug: hard-object-references
readOn: 
    - https://dev.to/alexander-nenashev/hard-object-references-stable-object-references-for-mutable-application-state-6el
    - https://coderlegion.com/22147/hard-object-references-stable-object-references-for-mutable-application-state?prompt=cl_engage_notification
seoDescription: "Hard Object References is a mutable state discipline for JavaScript and TypeScript: stable object references, copy-in updates, stale alias prevention, and safer object graphs."
description: "I explain Hard Object References as a practical rule for mutable application state: use stable object and array references, avoid rebinding and nested reference replacement, and copy data into existing objects instead. This approach helps reduce stale aliases, obsolete references, and hard-to-debug state bugs in complex TypeScript and frontend applications."
---
# Hard Object References: Stable Object References for Mutable Application State

In JavaScript and TypeScript, object references are often treated as disposable. An object is created, assigned to a variable, passed around, replaced, copied, spread, cloned, and eventually discarded.

That is normal language behavior, but in larger mutable systems it creates a specific class of bugs: stale aliases.

A stale alias appears when one part of the program still holds a reference to an old object while another part has already replaced that object with a new one. The old reference is still valid JavaScript, but it no longer points to current data.

Hard Object References is a discipline for avoiding that class of bugs.

The idea is simple:

> Object and array references should be stable. Do not replace them as a normal update mechanism. Copy data into existing objects instead.

This rule is useful for application state, but it is not limited to global stores. It applies to ordinary variables, local component state, nested fields, arrays, drafts, snapshots, runtime models, and temporary objects.

The broader principle is:

> Replace primitive values. Do not replace object and array references.

## The First Rule: `const` for Objects and Arrays

The first level is variable bindings.

If a variable holds an object or array, it should normally be declared with `const`:

```ts
const user = { /* ... */ };

const items = [ /* ... */ ];
```

not:

```ts
let user = { /* ... */ };

let items = [ /* ... */ ];
```

The point is not that the object becomes immutable. It does not.

This is still possible:

```ts
user.name = 'Alex';
items.push(nextItem);
```

The point is that the variable should not be rebound to a different object:

```ts
user = nextUser;
items = nextItems;
```

That replacement changes which object the variable points to. Any other code that still holds the old reference now points to obsolete data.

So the first rule is:

> Use `const` for object and array references. Mutate or copy data into the object. Do not rebind the reference.

This rule also applies to temporary objects. A temporary object may be short-lived, but while it exists, its reference should still be stable.

## The Stale Alias Problem

Consider this code:

```ts
const user = {
    name: 'John',
    address: {
        city: 'Paris',
        street: 'Main'
    }
};

const address = user.address;
```

Now another part of the code replaces the nested object:

```ts
user.address = {
    city: 'Berlin',
    street: 'Main'
};
```

After this assignment:

```ts
address === user.address; // false
```

The variable `address` still points to a valid object, but it points to obsolete data.

That is the dangerous part. The program does not necessarily crash. It continues to operate on the wrong object.

A Hard Object References approach avoids the replacement:

```ts
HardObject.set(user.address, {
    city: 'Berlin'
});

address === user.address; // true
address.city; // 'Berlin'
```

The reference stayed stable. The data changed.

## Temporary Objects Are Not an Exception

A temporary object is not an excuse to use unstable references.

This is fine:

```ts
const draft = {
    // ...
};

HardObject.set(draft, {
    name: 'Alex',
    address: {
        city: 'Berlin'
    }
});
```

This is suspicious:

```ts
let draft = {
    // ...
};

draft = {
    name: 'Alex',
    address: {
        city: 'Berlin'
    }
};
```

The object may be temporary, but rebinding the reference still breaks the same mental model.

If a temporary object needs new data, copy the data into it:

```ts
HardObject.set(draft, nextDraftData);
```

not:

```ts
draft = nextDraftData;
```

This matters because temporary objects often become inputs to state updates:

```ts
const draft = {
    // ...
};

HardObject.set(draft, formData);
HardObject.set(state.user, draft);
```

The draft is not necessarily installed application state, but it still follows the same reference discipline.

So the stronger rule is:

> The reference-stability discipline applies to objects in general. Application state is where violating it becomes most expensive.

## Application State Makes the Rule Critical

In small local code, replacing an object may be harmless.

In application state, the same operation becomes dangerous because many parts of the program may retain references to the same object:

```ts
const selectedAddress = state.user.address;
const editorTarget = state.user.address;
const validationTarget = state.user.address;
const renderTarget = state.user.address;
```

If this happens later:

```ts
state.user.address = nextAddress;
```

all previous references may become stale.

This is why Hard Object References is especially important for state graphs:

```ts
state.user
state.user.address
state.settings
state.document
state.document.pages
state.selection
```

These are not just values. They are live reference nodes.

Once an object participates in such a graph, replacing its reference should not be the normal update mechanism.

## From Principle to Utility

The principle can be followed manually:

```ts
const state = {
    // ...
};

HardObject.set(state.user, nextUser);
HardObject.set(state.settings, nextSettings);
HardObject.set(state.items, nextItems);
```

But a consistent helper can make the rule explicit.

For explanation, call that helper `HardObject`.

`HardObject` is not the principle itself. It is only one possible way to express the principle:

```ts
const state = HardObject.create(rawState);
```

The purpose of `HardObject.create()` is to install an object graph under a hard-reference contract.

The matching update operation is:

```ts
HardObject.set(state.user, nextUser);
```

This means:

> Copy compatible data from `nextUser` into `state.user` without replacing object or array references.

So the conceptual pair is:

```ts
const state = HardObject.create(rawState);

HardObject.set(state.user, nextUser);
```

`create()` establishes the hard-reference boundary.
`set()` updates data inside that boundary.

## Type-Level Installation

In the simplest implementation, `HardObject.create()` can be only a TypeScript-level identity function.

At runtime, it may simply return the same object:

```ts
class HardObject {
    public static create<T>(value: T): Hard<T> {
        return value as Hard<T>;
    }
}
```

The value is returned as-is, but TypeScript can expose it as a type where object and array references are readonly.

A simplified type could look like this:

```ts
type Primitive =
    | string
    | number
    | boolean
    | bigint
    | symbol
    | null
    | undefined;

type Hard<T> =
    T extends Primitive
        ? T
        : T extends Array<infer TItem>
            ? ReadonlyArray<Hard<TItem>>
            : {
                readonly [TKey in keyof T]: Hard<T[TKey]>;
            };
```

This version is intentionally simplified. A real implementation may use a more refined type where primitive fields remain writable while object and array references become readonly.

The architectural point is:

> `HardObject.create()` gives the object graph a hard-reference contract.

That contract can start as TypeScript-only. Later, it can add runtime enforcement without changing the call site.

## Runtime Enforcement

TypeScript can catch many mistakes during development, but it does not enforce the rule at runtime.

If runtime enforcement is needed, `HardObject.create()` can recursively walk the object graph.

Whenever it finds a property whose value is an object or array, it can make that property non-writable on its parent object:

```ts
Object.defineProperty(target, key, {
    value,
    writable: false,
    configurable: false,
    enumerable: true
});
```

Then it continues recursively into that nested object or array and applies the same rule to its children.

The developer does not manually lock every nested property. `HardObject.create()` is the centralized installation point.

So `HardObject.create()` can evolve in stages:

| Stage             | Runtime behavior                                | Purpose                                          |
| ----------------- | ----------------------------------------------- | ------------------------------------------------ |
| Type-only         | Returns the same object                         | Provides a TypeScript hard-reference contract    |
| Runtime-enforced  | Recursively locks object/array fields           | Prevents object-reference replacement at runtime |
| Framework adapter | Installs the graph into a reactive/store system | Integrates with a specific environment           |

The rule is not:

> Nothing can change.

The rule is:

> Primitive values may change. Object and array references should remain stable.

So this is a normal update:

```ts
state.user.name = 'Alex';
state.user.address.city = 'Berlin';
```

But this is not:

```ts
state.user.address = {
    city: 'Berlin',
    street: 'Main'
};
```

The `address` reference is hard.

The correct update path is:

```ts
HardObject.set(state.user, {
    address: {
        city: 'Berlin'
    }
});
```

## Updating a Hard Object Graph

`HardObject.set()` is a copy-in operation:

```ts
HardObject.set(state.user, {
    name: 'Alex',
    address: {
        city: 'Berlin'
    }
});
```

It means:

> Copy compatible data from the source object into the target object without replacing object and array references.

Primitive fields can be assigned directly:

```ts
name: 'Alex'
```

Nested objects are updated recursively:

```ts
address.city = 'Berlin'
```

But the `address` object itself is not replaced.

Arrays follow the same principle: the array reference remains stable, while its contents are updated through controlled logic.

The exact implementation can vary. `HardObject` may be a utility, a base class, a model method, a store helper, or a framework-specific adapter. The concept is lower-level than any one implementation.

## Change Tracking

A common objection is:

> If references do not change, how do you detect changes?

The answer depends on the environment.

In a reactive system, reference replacement does not have to be the primary change signal. If primitive fields and nested object properties are reactive, then normal mutation tracking can already observe changes inside the stable object graph.

For example, in Vue or a similar reactive system, a deep watcher, computed dependency, proxy trap, or framework-level reactive effect may observe this operation:

```ts
HardObject.set(state.user, {
    name: 'Alex',
    address: {
        city: 'Berlin'
    }
});
```

The reference stays stable, but reactive property writes still occur.

In that case, `HardObject.onChange()` may not be necessary. The reactive system already provides change tracking.

In a non-reactive system, `HardObject` can provide a simple explicit notification mechanism:

```ts
HardObject.onChange(change => {
    // mark dirty, update UI, notify observers, sync state, etc.
});
```

`HardObject.set()` can emit a change only if it actually changed at least one value. If the incoming data is equal to the current data, no change event is needed.

So the rule is:

> Do not require object replacement to be the change signal.

Use the mechanism that fits the environment: framework reactivity, deep watchers, proxy-based tracking, explicit events, dirty flags, version counters, or observers.

Hard Object References only says that object references should remain stable. It does not prescribe one universal change-tracking system.

## Contrast with Immutable State

Immutable update style treats state as a value. Updating state usually means producing a new object graph:

```ts
const nextState = {
    ...state,
    user: {
        ...state.user,
        name: 'Alex'
    }
};
```

Reference replacement is intentional. Changed references are used to detect changed branches.

Hard Object References uses a different model:

```ts
HardObject.set(state.user, {
    name: 'Alex'
});
```

The object remains the same. Its data changes.

The central contrast is:

> In immutable systems, references are change signals.
> In Hard Object References, references are stable addresses.

## Comparison

| Topic                    | Immutable Update Style                  | Hard Object References                                   |
| ------------------------ | --------------------------------------- | -------------------------------------------------------- |
| Main model               | State as value                          | State as object graph                                    |
| Update mechanism         | Produce new state                       | Copy into existing graph                                 |
| Object binding           | May be replaced                         | Prefer `const` for object/array references               |
| Object field replacement | Normal                                  | Forbidden or controlled                                  |
| Object identity          | Often disposable                        | Stable                                                   |
| Nested references        | Commonly replaced                       | Preserved                                                |
| Change signal            | Reference change                        | Reactivity, event, dirty flag, version counter, observer |
| Best fit                 | Serializable state, reducers, snapshots | Complex mutable runtime state                            |
| Main risk                | Stale captured old state                | Uncontrolled mutation                                    |

Neither model is universally better.

Immutable updates are excellent when state is mostly plain data and the architecture benefits from treating every update as a value transformation.

Hard Object References is useful when state is a mutable object graph and references are used as live handles.

## Where This Works Well

Hard Object References fits systems where object references are retained and reused over time:

- complex frontend state
- large component-local state
- document editors
- visual editors
- reader engines
- graph editors
- timeline editors
- canvas or layout tools
- class-based domain models
- runtime controllers
- selection models
- render pipelines
- async processes that keep object handles

The boundary is not global state versus local state.

A large component with complex internal state can suffer from the same stale-reference problems as an application-level store. If nested objects are passed around inside that component and later replaced, local aliases can become obsolete too.

The real boundary is:

> Can another piece of logic keep this object reference and later expect it to remain current?

If yes, the reference should usually be hard.

## When This Rule Is Less Important

This discipline is less critical for:

* primitive values
* short-lived scalar calculations
* small isolated functions
* pure transformation pipelines
* immutable reducer-based architectures
* throwaway objects that never escape their local scope

Even in these cases, the rule can still be useful as a default bias, because reference stability depends on a question that is often hard to answer upfront:

> Can this reference escape, be retained, or become obsolete after replacement?

## Benefits

The main benefit is not less code. The main benefit is a stronger state invariant.

Object references remain valid.

Retained object handles do not silently become obsolete.

Nested state ownership becomes clearer.

Debugging gets a simple rule:

> If an object reference changed, something violated the reference discipline.

This is especially useful in systems where many subsystems interact with the same mutable object graph.

## Costs

The costs are real.

Mutation must be controlled. If every part of the application mutates everything freely, the system becomes unstable.

Change tracking must exist. In reactive systems, this may already be handled by the framework. In non-reactive systems, it may require explicit events, observers, dirty flags, or version counters.

The approach is also less natural for tooling built around immutable snapshots, reducer replay, time travel, and structural sharing.

Hard Object References is not a replacement for immutable architecture in every application. It is a different tradeoff for a different kind of state.

## Conclusion

Hard Object References treats object references as stable addresses, not disposable values.

The rule starts with mandatory use of `const` with objects and arrays and continues inside object graphs:

```ts
HardObject.set(user.address, nextAddress);
```

not:

```ts
user.address = nextAddress;
```

A utility such as `HardObject` can make the rule explicit. `HardObject.create()` establishes a hard-reference contract. It can start as a type-level identity function and later add runtime enforcement without changing the call site. `HardObject.set()` updates the graph by copying data into existing references.

This is not presented as a newly invented universal pattern. The underlying concerns are old: object identity, aliasing, ownership, mutation control, and stable object graphs. Hard Object References is my practical formulation of those concerns after repeatedly seeing the same class of bugs in mutable applications: references becoming obsolete because some part of the object graph was replaced instead of updated.

In my own code, this discipline became a stability rule. It reduces Heisenbug-like behavior where the program still runs but some logic works with a detached object. It also changes the mental model: objects are no longer disposable containers that can be swapped at any level. They become stable addresses, and updates become explicit data transfer into those addresses.

The core rule is:

> Replace primitive values. Do not replace object and array references.

Or shorter:

> References are not change signals. They are stable addresses.

