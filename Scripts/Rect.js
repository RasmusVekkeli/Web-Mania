/*
 * Rect class contains properties of a rectangle
 * 
 * Inherited properties from Vector2:
 * x: X-coordinate of the upper left corner of the rectangle
 * y: Y-coordinate of the upper left corner of the rectangle
 * 
 * Properties:
 * w: Width of the rectangle
 * h: Height of the rectangle
 * 
 * Constructor parameters:
 * x: Desired X-coordinate of the upper left corner of the rectangle
 * y: Desired Y-coordinate of the upper left corner of the rectangle
 * width: Desired width of the rectangle
 * height: Desired height of the rectangle
 * 
 * Parameters will be checked for valid types
*/
class Rect extends Vector2 {
	constructor(x, y, width, height, skipTypeCheck = false) {
		if (!skipTypeCheck) {
			const expectedParameterTypes = [["number", "undefined", "null"], ["number", "undefined", "null"], ["number", "undefined", "null"], ["number", "undefined", "null"], "any"];
			ValidateParameterTypes(arguments, expectedParameterTypes);
		}

		super(x, y, true);

		this.w = (width === undefined ? null : width);
		this.h = (height === undefined ? null : height);
	}
}