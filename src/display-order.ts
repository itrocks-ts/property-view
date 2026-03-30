import { ObjectOrType }        from '@itrocks/class-type'
import { Type }                from '@itrocks/class-type'
import { typeOf }              from '@itrocks/class-type'
import { representativeOf }    from '@itrocks/class-view'
import { decorateCallback }    from '@itrocks/decorator/class'
import { decoratorOfCallback } from '@itrocks/decorator/class'
import { ReflectClass }        from '@itrocks/reflect'

const DISPLAY_ORDER = Symbol('displayOrder')

export function defaultDisplayOrderProperties<T extends object>(target: Type<T>)
{
	const propertyNames  = new ReflectClass(target).propertyNames
	const representative = representativeOf(target)
	return [...new Set([...representative, ...propertyNames])]
}

export function DisplayOrder<T extends object>(...properties: (keyof T)[])
{
	return decorateCallback<T>(
		DISPLAY_ORDER,
		target => properties.length ? properties : defaultDisplayOrderProperties(target)
	)
}

export function displayOrderOf<T extends object>(target: ObjectOrType<T>)
{
	return decoratorOfCallback<T, (keyof T)[]>(
		target,
		DISPLAY_ORDER,
		target => defaultDisplayOrderProperties(typeOf(target))
	)
}
