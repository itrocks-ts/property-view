import { KeyOf }               from '@itrocks/class-type'
import { ObjectOrType }        from '@itrocks/class-type'
import { Type }                from '@itrocks/class-type'
import { typeOf }              from '@itrocks/class-type'
import { representativeOf }    from '@itrocks/class-view'
import { decorateCallback }    from '@itrocks/decorator/class'
import { decoratorOfCallback } from '@itrocks/decorator/class'
import { CollectionType }      from '@itrocks/property-type'
import { ReflectClass }        from '@itrocks/reflect'

const DISPLAY_ORDER = Symbol('displayOrder')

export function defaultDisplayOrderProperties<T extends object>(target: Type<T>)
{
	const properties = Array.from(new ReflectClass<T>(target).properties)
		.filter(property => !(property.type.lead instanceof CollectionType))
		.map(property => property.name)
	const representative = representativeOf(target)
	return representative.concat(properties.filter(property => !representative.includes(property)))
}

export function DisplayOrder<T extends object>(...properties: KeyOf<T>[])
{
	return decorateCallback<T>(
		DISPLAY_ORDER,
		target => properties.length ? properties : defaultDisplayOrderProperties(target)
	)
}

export function displayOrderOf<T extends object>(target: ObjectOrType<T>)
{
	return decoratorOfCallback<T, KeyOf<T>[]>(
		target,
		DISPLAY_ORDER,
		target => defaultDisplayOrderProperties(typeOf(target))
	)
}
