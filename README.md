[![npm version](https://img.shields.io/npm/v/@itrocks/property-view?logo=npm)](https://www.npmjs.org/package/@itrocks/property-view)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/property-view)](https://www.npmjs.org/package/@itrocks/property-view)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/property-view?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/property-view)
[![issues](https://img.shields.io/github/issues/itrocks-ts/property-view)](https://github.com/itrocks-ts/property-view/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# property-view

Decorators for user-friendly identification and ordering of domain properties.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/property-view
```

## Usage

`@itrocks/property-view` helps you control how domain model properties are:

- **displayed** to end‑users (labels, headings, column titles…),
- **ordered** when iterating over a class properties (forms, tables, detail views…),
- **reflected** through `@itrocks/reflect` and related tooling.

You typically:

1. decorate your model properties with `@Display()` when you need a specific, user‑friendly label,
2. decorate your classes with `@DisplayOrder()` when you want a predictable order for their properties,
3. call `initOrderedProperties()` once at startup so every `ReflectClass` instance exposes
   an `orderedProperties()` helper.

### Minimal example

```ts
import { Display, DisplayOrder, initOrderedProperties } from '@itrocks/property-view'

// Initialise once at application startup so ReflectClass gains orderedProperties()
initOrderedProperties()

@DisplayOrder('lastName', 'firstName', 'email')
class User
{
	@Display('First name')
	firstName = ''

	@Display('Last name')
	lastName  = ''

	email     = ''
}
```

Here:

- the `User` properties will be considered, by default, in the order
  `lastName`, `firstName`, `email`,
- UI layers that rely on `displayOf()` will show `"First name"` and
  `"Last name"` instead of the raw property identifiers.

### Complete example: building labels and ordered fields

The following example shows how this package is usually combined with
`@itrocks/class-type`, `@itrocks/reflect` and `@itrocks/rename` in order to
produce a simple HTML form:

```ts
import type { ObjectOrType }   from '@itrocks/class-type'
import { ReflectClass }        from '@itrocks/reflect'
import { Display, displayOf }  from '@itrocks/property-view'
import { DisplayOrder }        from '@itrocks/property-view'
import { initOrderedProperties } from '@itrocks/property-view'
import { toCssId, toField }    from '@itrocks/rename'

// 1. Enable orderedProperties() on ReflectClass
initOrderedProperties()

@DisplayOrder('lastName', 'firstName', 'email')
class Contact
{
	@Display('First name')
	firstName = ''

	@Display('Last name')
	lastName  = ''

	email     = ''
}

// 2. Render a basic HTML form using the display labels and property order
function renderForm<T extends object>(type: ObjectOrType<T>): string
{
	const rc          = new ReflectClass<T>(type)
	const fieldsHtml  = rc.orderedProperties()
		.map(property => {
			const name      = property.name as keyof T
			const id        = toCssId(name)
			const fieldName = toField(name)
			const label     = displayOf(type, name)
			return `<label for="${id}">${label}</label>`
				+ `<input id="${id}" name="${fieldName}" type="text">`
		})
		.join('')

	return `<form>${fieldsHtml}</form>`
}

const html = renderForm(Contact)
```

Although real projects will typically go through higher‑level helpers (for
example `@itrocks/framework`), the example above illustrates the core
responsibility of this package: *decide how properties are labelled and in
which order they appear*.

## API

### Main module: `@itrocks/property-view`

The public API re‑exports the following symbols:

- `Display`, `displayOf` from `./display`,
- `DisplayOrder`, `displayOrderOf` from `./display-order`,
- `initOrderedProperties` from `./ordered-properties`.

#### `function Display<T extends object>(name = '')`

Property decorator used to control the *display name* of a field.

When you omit `name`, a human‑friendly label is derived from the property
identifier using `@itrocks/rename` (for example `firstName` → `"First name"`).

##### Parameters

- `name` *(optional, default: empty string)* – explicit label to associate to
  the property. If left empty, the label is built automatically from the
  property name.

##### Usage

```ts
class Product
{
	@Display('Unit price (tax excl.)')
	unitPrice = 0

	// Will display as "Creation date" by default
	createdAt?: Date
}
```

#### `function displayOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): string`

Reads the display name associated with a property on a class or instance.

If the property was decorated with `@Display('...')`, the configured label is
returned. Otherwise `displayOf` falls back to an automatic label derived from
the property identifier.

Typical consumers are form generators, table components, or any UI layer that
needs stable, user‑facing labels.

##### Parameters

- `target` – the class constructor or an instance containing the property.
- `property` – the property key whose display name you want to resolve.

##### Return value

- `string` – the resolved display label for the property.

##### Usage

```ts
const label = displayOf(Product, 'unitPrice')
// → "Unit price (tax excl.)"
```

#### `function DisplayOrder<T extends object>(...properties: KeyOf<T>[])`

Class decorator that defines the preferred ordering of a model properties when
displayed in lists, forms, or detail views.

If you do not specify any property, the order is computed automatically by
`defaultDisplayOrderProperties()` (see below).

##### Parameters

- `...properties` – list of property names describing the desired order. Any
  property not listed here will be appended afterwards, in their natural
  reflection order.

##### Usage

```ts
@DisplayOrder('code', 'label', 'active')
class Category
{
	code   = ''
	label  = ''
	active = true
}
```

#### `function displayOrderOf<T extends object>(target: ObjectOrType<T>): KeyOf<T>[]`

Reads the property order associated with a target class or instance.

The function behaves as follows:

- if a `@DisplayOrder()` decorator is present, its value is returned,
- otherwise, the order is computed by `defaultDisplayOrderProperties()` using
  `@itrocks/class-view` to take representative properties into account and then
  append the remaining ones.

This function is typically used by helper utilities such as
`ReflectClass.prototype.orderedProperties`.

##### Parameters

- `target` – class constructor or instance whose property order you want to
  obtain.

##### Return value

- `KeyOf<T>[]` – array of property names in the order they should be
  displayed.

##### Usage

```ts
const order = displayOrderOf(Category)
// → ['code', 'label', 'active']
```

#### `function initOrderedProperties(): void`

Initialisation helper that adds an `orderedProperties()` method to
`ReflectClass.prototype`.

After calling this function once (typically at application startup), any
`ReflectClass<T>` instance gains the method:

```ts
orderedProperties(): ReflectProperty<T>[]
```

which returns the list of reflected properties, ordered first according to
`displayOrderOf(type)` and then completed by any remaining properties.

This wiring is intentionally performed through `// @ts-ignore` so that
templates (for example in `@itrocks/framework`) can call `orderedProperties()`
without requiring extra type declarations.

##### Usage

```ts
import { ReflectClass }         from '@itrocks/reflect'
import { initOrderedProperties } from '@itrocks/property-view'

initOrderedProperties()

const rc        = new ReflectClass(Category)
const ordered   = rc.orderedProperties()
// ordered[0].name === 'code'
```

## Typical use cases

- **Generate HTML forms** where fields are labelled and ordered consistently
  across all views of a given model.
- **Build data tables** reusing the same display labels and order for column
  headers.
- **Admin back‑offices** where you quickly scaffold CRUD screens based on
  reflected classes and want sensible defaults for labels and property order.
- **API or export tooling** which needs human‑readable column names or keys in
  a stable order.
- **Generic UI components** that operate on arbitrary domain objects but still
  need user‑friendly labels and predictable ordering.
