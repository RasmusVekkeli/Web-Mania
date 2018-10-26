/*
 * Vector2 class contains coordinates to a point
 * 
 * x: X-coordinate of a point
 * y: Y-coordinate of a point
 * 
 * Constructor parameters:
 * x: Desired X-coordinate of the point, if not set, the value will be set as null
 * y: Desired Y-coordinate of the point, if not set, the value will be set as null
 * skipTypeCheck: Skips parameter type validation if true. Should only be true in class constructors that inherit from this class
 * 
 * Parameters will be checked for valid types if skipTypeCheck is false or empty
*/
class Vector2 {
	constructor(x, y, skipTypeCheck = false) {
		if (!skipTypeCheck) {
			const expectedParameterTypes = [["number", "undefined", "null"], ["number", "undefined", "null"], "any"];
			ValidateParameterTypes(arguments, expectedParameterTypes);
		}

		this.x = (x === undefined ? null : x); 
		this.y = (y === undefined ? null : y); 
	}
}