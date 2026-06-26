---
slug: senior-frontend-develop-at-hotels-ru
seoDescription: Vue 3 / TypeScript / Vite SPA for hotel and train ticket reservations, with custom Vite plugins, interactive maps, dynamic SVG train-seat layouts, client-side filtering, complex booking state, and a reusable form validation framework.
description: Vue 3 / TypeScript / Vite SPA for hotel and train ticket reservations, with custom Vite plugins, interactive maps, dynamic SVG train-seat layouts, client-side filtering, complex booking state, and a reusable form validation framework.
---

# Hotel and Train Ticket Booking SPA

## Overview

This is a B2B travel booking application used by company employees and internal operators to reserve hotels and train tickets for customers. The application supports operator-grade booking workflows: hotel search, hotel filtering, interactive map exploration, railway route search, train selection, car and seat selection, passenger data entry, validation, prebooking, and final reservation submission.

The frontend is a Vue 3 / TypeScript / Vite SPA integrated into an existing travel platform. My work focused on advanced frontend engineering: custom Vite tooling, complex reactive booking state, client-side filtering, interactive maps, dynamic SVG-based train layouts, custom form infrastructure, and reusable UI components for dense reservation workflows.

## Role

Senior Frontend Developer / Frontend Architecture.

I implemented advanced frontend functionality across the hotel and railway booking flows, including custom Vite plugins, routing infrastructure, client-side filtering, interactive Yandex Maps integration, dynamic SVG-to-Vue rendering for train layouts, complex order-state management, and a custom form/input validation framework.

## Product Context

The application is used by operators who process reservations on behalf of customers. This creates stricter UX requirements than a simple public booking form: operators need fast filtering, predictable navigation between booking steps, persistent form data, clear validation, structured passenger data, and reliable handling of supplier-specific edge cases.

The railway booking flow includes several dependent steps:

1. Search route and travel dates.
2. Select outbound and optional return trains.
3. Select car groups and concrete cars.
4. Select seats by graphical scheme or by preferences.
5. Validate passenger and seat-selection rules.
6. Enter passenger and customer data.
7. Submit reservation and handle conflict/confirmation cases.

The hotel booking flow includes:

1. Hotel search by destination, dates, and guests.
2. Incremental result loading.
3. Client-side filtering by hotel and rate-plan properties.
4. Interactive map view.
5. Hotel details, photos, room plans, and policies.
6. Prebooking and final order submission.

## Custom Vite Tooling

I implemented a custom Vite build layer instead of relying only on standard Vue plugin behavior.

The project included a shared Vite configuration that automatically discovered local `vite.plugin.*` modules, applied project-level and shared frontend plugins, configured aliases, injected global SCSS mixins/theme data, and generated a multi-entry build for separate application entry points.

The most important custom plugin was an SFC transform pipeline. It parsed Vue SFC templates before Vue compilation and applied custom transforms to the template DOM. This enabled project-specific syntax and build-time automation.

Implemented Vite/SFC tooling included:

* automatic discovery and loading of custom Vite plugins;
* custom bare-name component resolution for `.vue` and `.ts` components;
* template-level auto-import of Vue components based on encountered tags;
* directive auto-import from the local directives directory;
* custom `v-show.lazy` transform that converts lazy visibility into delayed `v-if` mounting;
* multi-entry Vite build for search, hotel results, and train results apps;
* shared alias resolution for source, service, design, image, and data imports;
* global SCSS mixin/theme injection through Vite preprocessor options.

This reduced component boilerplate and gave the codebase framework-level behavior tailored to the application instead of generic project defaults.

## Modular SPA Integration

The frontend is split into separate application entry points for search, hotel results, and train results. These apps are mounted into existing platform pages through a small injection layer that passes server-provided page data into Vue application instances.

This allows Vue modules to coexist with the wider platform while still using modern Vue Router, Composition API, dynamic imports, TypeScript-oriented module structure, and Vite build output.

The routing layer was also customized. It supports compact route definitions, nested relative route names, route-level parse/stringify functions, reactive `viewRoute` metadata, route-param preservation, and helper methods such as `pushParams()` and `replaceParams()`. This is especially useful for deeply parameterized booking routes: hotel search params, dates, guests, map state, selected hotel, photo dialogs, train direction state, selected train, selected car, selected seats, and order pages.

## Client-Side Filtering Architecture

The application uses a client-side filtering architecture for search results and train options. I implemented reusable filtering abstractions around filter dimensions, grouped values, selected items, incremental updates, remove/reload operations, and filter event dispatching.

The filtering system supports:

* reusable filter widgets;
* multi-value filters;
* range filters;
* AND-mode filters;
* distinct counting;
* grouped aggregation;
* reactive filter item counts;
* filter restoration after data updates;
* item-level update/remove handling;
* selection state synchronized with filtered result sets.

In the hotel flow, rate plans are filtered client-side while visible hotels are derived from filtered plan IDs. In the train flow, filters are applied to train, car, service, time, price, and availability dimensions while the UI remains reactive as train and car data loads asynchronously.

This design avoids excessive backend round trips for every filter operation and makes dense search-result interaction responsive.

## Interactive Hotel Map

The hotel results page includes an interactive Yandex Maps view loaded lazily only when the user opens the map mode. The map component is dynamically imported after the Yandex Maps API becomes available, with graceful fallback behavior if the map cannot be loaded.

The map integration includes:

* lazy loading of the Yandex Maps API;
* dynamic Vue component import for the map view;
* Yandex clusterer integration;
* custom placemark layouts rendered from hotel-card data;
* price markers based on the cheapest visible rate plan;
* active marker state with expanded hotel-card preview;
* multiple hotels at the same coordinates grouped into one marker;
* route synchronization for map center and zoom;
* restoration of map state from route params;
* automatic map bounds adjustment;
* click-through from active map cards to hotel details.

The hotel service layer also supports location enrichment, including geocoding-based updates when hotel metadata is incomplete.

## Dynamic SVG Vue Components for Train Layouts

One of the most technically advanced parts of the project is the graphical train car seat-layout interaction.

Railway car schemes are loaded as SVG/HTML fragments from the supplier API. Instead of rendering them as static images, the frontend parses the SVG, patches the SVG DOM, injects Vue bindings into seat elements, scopes embedded SVG styles, and compiles the resulting template as an interactive Vue component.

This converts supplier-provided SVG layouts into dynamic Vue-driven seat selectors.

The seat-layout system supports:

* dynamic compilation of SVG fragments into Vue-renderable components;
* DOM patching of seat elements by IDs such as `Seat<number>`;
* injected Vue `:class` bindings for seat state;
* injected click handlers for free-seat SVG elements;
* tooltip rendering inside SVG seat nodes;
* gender-specific seat styling;
* selected/free/occupied seat visual states;
* two-storey car layouts;
* fallback preference-based selection when no SVG scheme is available.

The result is a graphical train-seat selector where operators can interact directly with train layout diagrams while all selection state remains connected to Vue reactivity and booking-state validation.

## Complex Train Booking State

The train booking flow uses a custom reactive state model built around direction-level and order-level domain classes.

The state model handles outbound and optional return directions independently while exposing shared validation and navigation logic at the top level. Each direction tracks selected train, selected car, loaded trains, loaded cars, selected places, place filters, special-seat conditions, loading errors, and derived validity of each booking step.

Implemented state logic includes:

* reactive class properties using Vue refs and computed values;
* automatic train fetching when route/date/station search params change;
* automatic car fetching after train selection;
* automatic scheme fetching after car selection;
* dependent page transitions between trains, cars, places, and order;
* validation of each booking step;
* support for outbound-only and round-trip flows;
* gender-cabin validation;
* special place validation for mother-and-baby and child seats;
* free-place range validation;
* automatic expansion of selected seats to compartment-related neighbor places when required by supplier reservation rules;
* derived passenger count from selected places;
* shared order payload construction from selected directions, cars, trains, places, passengers, and customer data.

This is domain-specific booking state, not simple component-local state. It combines route state, API-loaded data, graphical seat selection, business validation, and reservation payload construction into one controlled flow.

## Domain Object Normalization

Supplier API responses are normalized into richer frontend domain objects. Train, car, car group, place, hotel, room, and rate-plan objects receive derived properties, lazy prototype properties, stable IDs, normalized service lists, inferred features, and links back to parent entities.

Examples of this approach include:

* generating stable train IDs from train number, provider, date, and station codes;
* grouping raw car/place data into car groups and car entities;
* deriving free places from supplier strings;
* deriving service icons and service lists;
* deriving hotel and rate-plan features from provider metadata;
* converting hotel rooms and rate plans into objects with computed key features;
* adding lazy cached properties for expensive transformations.

This keeps UI components focused on presentation and interaction while domain objects handle supplier-specific data normalization.

## Custom Form Constructor and Validation Engine

The project includes a custom form framework built around reusable form containers, input registration, input wrappers, and custom input components.

The form layer uses Vue `provide/inject` to register child inputs into the nearest form context. Inputs can bind to nested data paths such as customer contacts or passenger fields, expose validation methods, report focus/dirty state, and receive server-side validation errors.

The form engine supports:

* nested form data paths;
* custom input registration;
* dirty-state detection;
* required-field validation;
* custom per-input validation callbacks;
* native validity integration for pattern/type mismatch;
* async submit handling;
* API validation error mapping;
* global form-level errors;
* localStorage persistence of partially entered booking data;
* automatic submit mode;
* form reset/focus methods exposed to parent components;
* JSON and `FormData` submission modes.

Custom inputs include text inputs, masked inputs, email inputs, phone inputs, country inputs, autocomplete, single-select, multi-select, date inputs, radio selects, checkbox inputs, password inputs, and textarea components.

The autocomplete component implements debounced async search, stale-request cancellation, keyboard handling, dropdown opening/closing, loading state, and optional auto-selection of the only result. Select components support grouped options, icons, descriptions, counts, disabled states, and reactive item updates.

## Order Forms

Hotel and train order forms reuse the same form infrastructure but apply different domain rules.

The hotel order form handles:

* prebooking before final order;
* company/contact data autofill;
* guest data collection;
* selected room/rate-plan data;
* payment data;
* privacy agreement validation;
* localStorage persistence of contact/passenger fields;
* final booking API call.

The train order form handles:

* passenger arrays represented by reactive domain objects;
* adult/child/baby ticket types;
* child-age validation;
* special-seat validation;
* similar-order confirmation flow;
* company payment selection;
* optional order remarks;
* full reservation payload generation from selected train directions.

## API Layer

The API layer provides a reusable request abstraction with token handling, payload normalization, content-type selection, JSON parsing with date revival, validation error conversion, authentication retry handling, supplier timeout handling, and support for JSON and `FormData` payloads.

This makes API integration more predictable and gives forms a consistent mechanism for receiving field-level validation errors.

## Performance and UX Techniques

The project includes several performance-oriented and UX-oriented techniques:

* lazy loading of heavy map functionality;
* dynamic imports for route-level and feature-level code splitting;
* incremental hotel result loading;
* async search with debouncing and stale-request cancellation;
* client-side result filtering to avoid unnecessary network requests;
* cached derived properties on normalized domain objects;
* delayed rendering through custom lazy visibility logic;
* selective mounting of heavy UI parts;
* reactive route-state synchronization;
* graphical train layout interaction instead of static form-only selection;
* reusable validation and error-display infrastructure.

These techniques improve operator efficiency in dense booking workflows where slow filtering, unstable route state, or unreliable form validation would directly reduce productivity.

## Technical Highlights

Key advanced techniques used in the project:

* custom Vite plugin system;
* SFC template transformation before Vue compilation;
* component and directive auto-import at template-transform level;
* custom lazy visibility transform compiled into reactive mounting logic;
* multi-entry Vite build integrated into an existing platform;
* Vue app injection into existing platform containers;
* custom Vue Router abstraction with route parsing/stringifying;
* client-side filtering and aggregation for hotel/train search results;
* lazy-loaded Yandex Maps integration;
* custom Yandex placemark layouts with hotel-card previews;
* map state synchronized through route params;
* runtime compilation of patched SVG train layouts into Vue components;
* graphical seat selection using supplier SVG schemes;
* reactive class-based state model for train booking steps;
* custom form constructor and validation framework;
* nested input registration through provide/inject;
* domain object normalization with lazy computed properties;
* complex passenger, seat, train, car, and reservation validation logic;
* incremental hotel result loading;
* localStorage persistence for partially completed order forms.

## Technologies

Vue 3, TypeScript, Vite, Vue Router, Composition API, SCSS, Yandex Maps JavaScript API, Inputmask, dynamic imports, runtime Vue template compilation, custom Vite plugins, custom form framework, custom filtering framework, reactive domain classes, REST API integration.

## Production Value

The application demonstrates frontend engineering beyond screen implementation. It required custom build-time tooling, runtime abstractions, complex state management, graphical interaction, client-side data filtering, reusable form infrastructure, and integration with external supplier APIs.

The strongest technical value is that the application solves complex operator workflows through custom frontend infrastructure: Vite plugins for developer productivity, client-side filtering for responsive result exploration, dynamic SVG compilation for train-seat selection, Yandex Maps for hotel exploration, and a reusable validation/form system for high-density booking forms.
