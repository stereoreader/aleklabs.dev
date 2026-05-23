---
date: 2026-05-18
slug: why-every-frontend-project-should-have-its-own-ui-layer
devtoUrl: https://dev.to/alexander-nenashev/why-every-frontend-project-should-have-its-own-ui-layer-3jj2
---
# Why Every Frontend Project Should Have Its Own UI Layer

Modern frontend development is heavily centered around component frameworks: Vue, React, Svelte, Solid, Angular, and others. The ecosystem also provides endless UI libraries: Vuetify, PrimeVue, Naive UI, MUI, Ant Design, Chakra, Radix, Headless UI, shadcn/ui, and hundreds more.

Most teams directly import these libraries into application code.

I think that is a long-term architectural mistake.

Every serious frontend project should have its own internal UI layer — its own component system — even if internally it relies almost entirely on third-party libraries.

Not because reinventing buttons is fun.
Because abstraction boundaries matter.

---

## The Problem With Directly Using UI Libraries

Direct usage tightly couples the application to external implementation details.

You start with something simple:

```vue
<ElButton type="primary" size="small">
    Save
</ElButton>
```

A year later:

* the library changes APIs,
* design requirements evolve,
* accessibility requirements appear,
* dark theme becomes mandatory,
* SSR breaks,
* bundle size becomes a problem,
* a component becomes abandoned,
* or the team simply wants another UI system.

Now the entire codebase depends on thousands of scattered library-specific decisions.

The UI library stops being a dependency.

It becomes infrastructure.

---

# Your UI Layer Is An Architectural Boundary

Instead of using third-party components directly, create your own application-level components:

```vue
<AppButton>
<AppInput>
<AppDialog>
<AppTable>
<AppDatePicker>
<AppPageLayout>
<AppEntityEditor>
```

Internally, these components may use:

* PrimeVue
* Vuetify
* Radix
* native browser APIs
* custom rendering
* or completely different implementations

The application itself should not care.

This creates a stable internal contract between the product and external dependencies.

The application talks to *your* UI architecture.

Your architecture talks to vendor libraries.

---

# Wrappers Are Not "Extra Boilerplate"

A common objection:

> "Why wrap everything? That's just unnecessary abstraction."

It is not abstraction for abstraction's sake.

It is containment.

The wrapper layer centralizes:

* naming conventions,
* defaults,
* accessibility,
* theme propagation,
* behavior normalization,
* analytics hooks,
* keyboard handling,
* validation,
* localization,
* performance workarounds,
* SSR compatibility,
* browser quirks,
* and migration strategy.

Without wrappers, all of this leaks into product code.

Then every page becomes infrastructure code.

---

# The Biggest Advantage: Replaceability

This is the most important benefit.

When UI libraries are hidden behind your own components, replacing them becomes feasible.

Example:

```txt
<AppDatePicker>
```

Today internally:

```txt
PrimeVue DatePicker
```

Tomorrow:

```txt
Flatpickr
```

Or:

```txt
Native browser date input
```

Or:

```txt
Custom implementation
```

The application code remains unchanged.

This matters more than most teams realize.

UI ecosystems move extremely fast. Libraries become abandoned surprisingly often.

A thin internal UI layer dramatically reduces migration cost.

---

# Mixing Multiple UI Libraries Becomes Safe

Direct usage of multiple UI systems usually creates chaos.

Different:

* design languages,
* spacing systems,
* keyboard behavior,
* focus handling,
* overlay logic,
* animation systems,
* theming models,
* and accessibility semantics.

But with an internal UI layer, multiple libraries can coexist safely.

Example:

* one library provides excellent tables,
* another has better dialogs,
* another has superior date pickers,
* another has accessible comboboxes.

Your application never sees this complexity directly.

Your wrapper layer normalizes it.

This is extremely powerful.

---

# Your UI Layer Is Also A Design System

The important shift:

Your design system should not belong to the UI vendor.

It should belong to the product.

That means:

* your naming,
* your semantics,
* your defaults,
* your UX patterns,
* your layout philosophy,
* your interaction rules.

Not whatever the library authors decided.

Example:

```vue
<AppDangerButton />
```

is far more meaningful than:

```vue
<ElButton type="danger" plain />
```

The first expresses product semantics.

The second expresses vendor implementation details.

That distinction becomes critical at scale.

---

# Default Configuration Reduces Massive Verbosity

One underrated benefit of internal wrappers:

They eliminate repetitive configuration.

Without wrappers:

```vue
<ThirdPartyInput
    size="small"
    variant="filled"
    density="compact"
    clearable
    rounded
    theme="dark"
/>
```

Repeated hundreds or thousands of times.

With wrappers:

```vue
<AppInput />
```

The wrapper already encodes:

* project defaults,
* theme defaults,
* accessibility defaults,
* density rules,
* validation behavior,
* localization behavior,
* analytics integration,
* focus handling.

This massively reduces UI noise in application code.

The application becomes more declarative.

---

# Theme Propagation Becomes Centralized

Third-party UI libraries usually bring their own theme systems.

That becomes problematic when multiple libraries coexist.

Each library wants:

* its own tokens,
* its own variables,
* its own dark mode implementation,
* its own color system.

Your internal UI layer solves this.

The application owns the real design tokens:

```css
:root {
    --color-bg: #ffffff;
    --color-text: #111111;
    --color-primary: #3b82f6;
}
```

Then wrapper components propagate these tokens into underlying libraries.

Your product controls the visual system.

Libraries adapt to *you*, not the other way around.

This is one of the cleanest ways to support:

* dark mode,
* white-labeling,
* custom themes,
* enterprise branding,
* runtime theme switching.

---

# Modern Browser APIs Make Custom UI More Realistic

Five years ago, fully custom UI infrastructure was expensive.

Today browsers provide much better primitives.

Examples:

* `<dialog>`
* Popover API
* anchor positioning
* `:has()`
* CSS nesting
* container queries
* inert
* view transitions
* modern focus management
* top-layer behavior

Especially important are the newer overlay-related APIs.

Historically, dialogs, dropdowns, popovers, tooltips, and context menus were extremely difficult because of:

* z-index wars,
* focus traps,
* scroll locking,
* portal systems,
* positioning,
* stacking contexts.

Modern browser primitives increasingly solve these problems natively.

This changes the economics of UI architecture.

Building internal abstractions is becoming cheaper and more maintainable.

---

# UI Architecture Is More Than Form Controls

Many teams think only about atomic components:

* buttons,
* inputs,
* selects,
* checkboxes.

But the real value appears higher in the hierarchy.

Your internal UI layer can orchestrate:

* page layouts,
* entity editors,
* filter panels,
* data tables,
* toolbar systems,
* sidebars,
* navigation structures,
* CRUD workflows,
* master-detail layouts,
* save/cancel flows,
* loading orchestration,
* permissions handling.

Example:

```vue
<EntityPage>
    <EntityToolbar />
    <EntityFilters />
    <EntityTable />
</EntityPage>
```

Now your product develops consistent workflow patterns.

Not just reusable buttons.

This is where frontend architecture starts becoming a platform.

---

# Internal UI Layers Improve Long-Term Stability

Projects live longer than frontend trends.

The average enterprise frontend outlives:

* multiple framework trends,
* multiple design trends,
* multiple UI libraries,
* and sometimes even multiple frontend teams.

A dedicated UI layer creates isolation from ecosystem volatility.

It reduces the blast radius of change.

That is not premature abstraction.

That is operational risk management.

---

# This Applies Beyond Vue

Vue examples are convenient because Vue component composition is extremely ergonomic.

But the idea is framework-agnostic.

The same architecture works in:

* React
* Svelte
* Angular
* Solid
* Web Components
* even server-rendered systems

Any component-based frontend benefits from stable internal UI contracts.

---

# A Practical Rule

One of the first architectural tasks in a frontend project should be:

> Define the project's internal UI hierarchy before building product pages.

Not after.

Not during migration.

Not after technical debt accumulates.

At the beginning.

Because once product code directly depends on third-party UI libraries, decoupling becomes expensive.

---

# Potential Downsides

This approach is not free.

Possible drawbacks:

* initial setup cost,
* additional maintenance,
* risk of over-abstraction,
* wrapper drift from underlying libraries,
* documentation burden,
* onboarding complexity,
* temptation to reinvent mature solutions.

Poorly designed wrappers can absolutely become worse than direct usage.

The goal is not to hide everything.

The goal is to own the architectural boundary.

---

# Final Thought

Frontend developers often discuss frameworks.

But frameworks are transient.

Architecture lasts much longer.

A frontend codebase should not structurally depend on the internal API decisions of a third-party UI vendor.

It should depend on its own UI language.

That language becomes one of the most valuable assets in the entire frontend architecture.

---

What additional advantages or disadvantages have you seen with internal UI layers and wrapper-based component systems?
