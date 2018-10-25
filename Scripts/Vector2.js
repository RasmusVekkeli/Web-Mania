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
 * Parameters will be checked for valid types
*/
class Vector2 {
	constructor(x, y) {
		const expectedParameterTypes = [["number", "undefined", "null"], ["number", "undefined", "null"]];
		ValidateParameterTypes(arguments, expectedParameterTypes);

		this.x = (x === undefined ? null : x); 
		this.y = (y === undefined ? null : y); 
	}
}