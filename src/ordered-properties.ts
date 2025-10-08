import { ReflectClass }   from '@itrocks/reflect'
import { displayOrderOf } from './display-order'

class OrderedPropertiesReflectClass<T extends object> extends ReflectClass<T>
{

	orderedProperties()
	{
		const properties   = this.properties
		const displayOrder = displayOrderOf(this.type)
		return displayOrder.map(propertyName => properties[propertyName])
			.concat(Object.values(properties).filter(property => !displayOrder.includes(property.name)))
	}

}

export function initOrderedProperties()
{
	// @ts-ignore Being added, for use into templates (without type checking)
	ReflectClass.prototype.orderedProperties = OrderedPropertiesReflectClass.prototype.orderedProperties
}
