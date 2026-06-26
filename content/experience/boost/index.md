---
slug: senior-frontend-develop-at-luqon
seoDescription: Built complex SPA interfaces, scalable frontend architecture with stores and reactive model classes, custom
            UI components including virtual tables and forms, and AI-agent-assisted delivery with E2E verification.
description: Built complex SPA interfaces, scalable frontend architecture with stores and reactive model classes, custom
            UI components including virtual tables and forms, and AI-agent-assisted delivery with E2E verification.
---

# Enterprise Resource Management SPA

BOOST is a modular Enterprise Resource Management SPA built with Vue 3, TypeScript, Vite, and a custom frontend framework. The application covers multiple business domains including sales, accounting, finance, HRM, inventory, procurement, document management, projects, work orders, facility management, contact center, users, settings, reporting, and API management.

The project is not a typical Vue application assembled from an external UI kit. Its frontend is structured as a platform: separate modular Vue applications are loaded through a shared shell, while domain models, stores, routing, data synchronization, UI components, editable tables, filters, dialogs, selectors, forms, and layout primitives are implemented as reusable internal packages.

## My Role

I designed and implemented the core frontend architecture and the custom UI/data framework used across the BOOST application modules.

My work included:

* modular Vue application architecture;
* shared shell application with dynamic app loading and cross-app navigation;
* custom `Model` class for reactive domain entities;
* shared repository/store layer for API access, local cache, synchronization, and entity lifecycle;
* IndexedDB entity caching with checksum-based synchronization;
* client-side filtering and search for large local data sets;
* virtual editable data table with custom cell rendering, keyboard interaction, row operations, sorting, filtering, and selection;
* custom UI component framework covering inputs, selects, tables, layouts, dialogs, file handling, model views, comments, task widgets, and domain-specific controls;
* strict TypeScript configuration across applications and shared packages.

## Source-Code Scale

The uploaded source archive shows a monorepo-style frontend structure:

* `applications/*` — separate business modules;
* `shell` — application shell, app loader, top navigation, side menu, tenant routing;
* `packages/ui` — custom UI framework;
* `packages/repository` — domain models, stores, API/cache synchronization;
* `packages/shared` — shared API and utilities;
* `packages/utils` — business-agnostic utilities.

The codebase contains 28 application directories, 578 Vue single-file components, 655 TypeScript files, approximately 160 `Model`-based domain classes, and more than 150 custom `lq-*` UI components.

## Modular SPA Architecture

BOOST is organized as a set of independent Vue application modules instead of one flat SPA. Each module exposes its own route configuration and is created through a shared `createVueApp()` factory. The shell discovers module entry points through Vite glob imports, mounts the active application into the shell container, and coordinates routing between modules.

This architecture gives the system clear module boundaries while keeping a unified UX and shared infrastructure. Business domains such as accounting, sales, projects, work orders, HRM, documents, settings, and users can evolve separately but still use the same model layer, routing conventions, table system, layout primitives, dialogs, and selectors.

The shell also implements cross-application navigation through a shared router bridge. It resolves route ownership, loads the required app, passes tenant-aware route params, and supports navigation between modules without treating the whole frontend as one monolithic route tree.

## Custom Domain Model Layer

The `Model` abstraction is one of the central parts of the project. It converts plain API data into rich reactive domain objects with methods, computed properties, nested child models, collections, lifecycle hooks, route metadata, persistence methods, and store integration.

The model layer supports:

* typed child models and child collections;
* partial and full entity loading;
* phantom UUIDs for unsaved editable entities;
* `create()`, `get()`, `getFull()`, `save()`, `update()`, `delete()`, `batchDelete()`, and custom request methods;
* route-aware item loaders;
* reactive class properties through custom ref/computed-ref helpers;
* nested collection synchronization before and after parent save;
* model-level event dispatch on updates;
* serialization/deserialization with date handling.

This gives the frontend a domain-oriented programming model instead of scattering business state across unrelated Vue components and ad hoc stores.

## Repository and Store Layer

The shared repository package connects the `Model` layer to API access, IndexedDB cache, MQTT synchronization, and application loading state.

Each model class can register a store through `createStore()`. The store exposes loaded items, item fetching, full loading, save/update/delete operations, query support, and error/loading state. This makes domain models self-contained: a component can work with `Item.items`, `SalesOrder.loadedItems`, `WorkOrder.getFull(UUID)`, or `JournalEntry.itemLoader` without manually wiring HTTP requests in every page.

The store layer also deduplicates concurrent item requests and keeps in-memory model instances synchronized when new data arrives.

## IndexedDB Caching and Synchronization

BOOST uses IndexedDB as a local entity cache for models whose storage policy allows it. The cache is tenant-aware and creates object stores dynamically based on entity metadata. Cached data is loaded into memory immediately, which improves perceived performance for large entity lists and repeated navigation.

The synchronization flow includes:

* immediate population from IndexedDB;
* server sync-state comparison;
* checksum-based validation;
* partial update loading when possible;
* full refresh fallback when local checksum validation fails;
* Web Worker usage for heavier sync work;
* local `EntitySyncState` storage;
* XOR/hash-based verification of local item versions.

This is substantially more advanced than simple `localStorage` caching. It is a client-side data persistence layer designed for large enterprise lists and long-running business sessions.

## Client-Side Filtering and Search

The UI framework includes a crossfilter-based filtering system used across list pages. It supports reusable filter widgets, search filters, select/multi-select filters, filter clearing, persistent filter state, and reactive updates when source data changes.

This design allows large lists to be loaded once, cached locally, and then filtered on the client without forcing every table interaction through backend round trips. It is especially useful for ERM/ERP-style interfaces where users repeatedly segment entities by status, customer, project, role, stock state, VAT/account data, work type, assignee, and other dimensions.

## Virtual Editable Data Table

The custom `lq-table` is a core technical feature of the project. It is not a basic table wrapper. It implements a reusable enterprise data grid with:

* virtual scrolling;
* fixed and dynamic row-height modes;
* editable cells;
* typed cell rendering;
* custom cell components;
* keyboard navigation;
* dirty/saved/error cell state;
* row add/delete/move operations;
* row selection and batch actions;
* sortable columns;
* configurable visible columns;
* search highlighting;
* readonly and editable modes;
* route activation on row click;
* pagination-table and page-table wrappers;
* tree-table variant.

The table is integrated with the custom input components and the model/store system, so it can be used both for readonly entity lists and dense editable business forms such as order lines, materials, time reports, accounting data, settings, attributes, and transactional rows.

## Custom UI Framework

The project includes a broad custom component library under `@boost/ui`. The naming convention is consistent (`lq-*`), and the components cover the main UI needs of a business application:

* inputs: text, number, integer, money, email, phone, masked input, textarea, datepicker, hour input, checkbox;
* selects: autocomplete, table select, tree select, multi-select, inline select, button select;
* layout: pages, sections, rows, columns, toolbar, topbar, tabs, cards, menus, popups;
* tables: editable table, page table, pagination table, tree table, row menu, row delete, table config;
* dialogs and modals;
* files and images;
* comments and notes;
* model utilities such as logs, model add, model footer, model notes;
* domain-specific controls for items, agreements, addresses, parties, projects, tasks, work orders, accounting, prices, and system units.

This demonstrates framework-level UI engineering: the project does not only contain many screens, it contains the reusable frontend system required to build those screens consistently.

## TypeScript and Code Organization

The workspace uses strict TypeScript settings, project references, shared path aliases, Vue type checking, and package-level builds. The codebase separates generic UI, data models, shared API logic, application modules, and shell-level orchestration.

The strict typing is visible not only in normal component props but also in deeper abstractions: table column definitions, typed model children, typed collections, route definitions, store interfaces, pagination, and model loaders.

## Business Domains Implemented

The source includes modules and model structures for multiple enterprise areas:

* sales orders and sales invoices;
* supplier invoices and payments;
* accounting, fiscal years, accounts, journal entries, bank accounts;
* inventory, items, item groups, item types, item attributes, price lists, campaigns;
* purchase orders and procurement suggestions;
* work orders, materials, time reports, statuses, forms;
* projects, scheduling, Gantt-style views, project settings;
* HRM employees and work schedules;
* contact center organizations and persons;
* document center, document approval groups, document automation, files;
* facility objects, systems, and units;
* users, roles, permissions, settings, and authorization;
* reports and dashboards.

This range matters because reusable frontend architecture is tested by domain diversity. A framework that works for editable sales order lines, document approval rules, work order materials, HR schedules, and inventory attributes is solving more than isolated page composition.

## Engineering Value

The main engineering value of BOOST is that it treats frontend development as a product platform problem. The codebase shows the ability to design abstractions that reduce repetition across many business modules while still handling complex UX and data cases.

For technical reviewers, the strongest signals are:

* independent modular Vue apps coordinated by a shell;
* reusable app factory and route parser;
* custom model/store abstraction rather than only component-local state;
* IndexedDB caching with sync verification;
* custom virtual editable table;
* crossfilter-based local filtering;
* custom UI framework instead of dependence on a generic UI kit;
* strict TypeScript across a large Vue codebase.

For HR or non-technical reviewers, the project demonstrates senior frontend ownership: I built the application architecture, data layer, and UI framework required for a complex enterprise system, not only individual screens.

## Technologies

Vue 3, TypeScript, Vite, Vue Router, Vue I18n, IndexedDB, Web Workers, MQTT over WebSocket, Axios, crossfilter2, SCSS, custom component framework, custom domain model layer, virtual scrolling, editable data grids, strict TypeScript, monorepo workspace architecture.
