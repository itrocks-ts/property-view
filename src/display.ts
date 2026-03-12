import { ObjectOrType }        from '@itrocks/class-type'
import { decorateCallback }    from '@itrocks/decorator/property'
import { decoratorOfCallback } from '@itrocks/decorator/property'
import { toDisplay }           from '@itrocks/rename'

const DISPLAY = Symbol('display')

export function Display<T extends object>(name = '')
{
	return decorateCallback<T>(DISPLAY, (_, property) => name.length ? name : toDisplay(property))
}

export function displayOf<T extends object>(target: ObjectOrType<T>, property: keyof T)
{
	return decoratorOfCallback<string, T>(target, property, DISPLAY, (_, property) => toDisplay(property))
}
