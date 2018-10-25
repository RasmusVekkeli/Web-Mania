/*
 * Vector2 class contains coordinates to a point
 * 
 * x: X-coordinate of a point
 * y: Y-coordinate of a point
 * 
 * Constructor parameters:
 * x: Desired X-coordinate of the point, if not set, the value will be set as null
 * y: Desired Y-coordinate of the point, if not set, the value will be set as null
 * 
 * Constructor will throw an exception if the parameter types are not number
*/
class Vector2 {
	constructor(x, y) {
		if (typeof x != "number" || typeof y != "number") {
			throw new TypeError(GenerateTypeErrorString(arguments, ["number", "number"]));
		}

		this.x = (x === undefined ? null : x); 
		this.y = (y === undefined ? null : y); 
	}
}