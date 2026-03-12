import { ReflectClass }    from '@itrocks/reflect'
import { ReflectProperty } from '@itrocks/reflect'
import { displayOrderOf }  from './display-order'

class OrderedPropertiesReflectClass<T extends object> extends ReflectClass<T>
{

	orderedProperties()
	{
		const displayOrder  = displayOrderOf(this.type)
		const propertyNames = this.propertyNames
		return [...new Set([...displayOrder, ...propertyNames])]
			.map(propertyName => new ReflectProperty(this, propertyName))
	}

}

export function initOrderedProperties()
{
	// @ts-ignore Being added, for use into templates (without type checking)
	ReflectClass.prototype.orderedProperties = OrderedPropertiesReflectClass.prototype.orderedProperties
}
