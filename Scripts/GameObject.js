/*
 * Template class for all game objects. Should only be inherited, not to be used as itself
 * 
 * 
*/
class GameObject {
	constructor(skipUpdate = false, skipDraw = false, skipTypeCheck = false) {
		if (!skipTypeCheck) {
			const expectedParameterTypes = ["boolean", "boolean", "any"];
			ValidateParameterTypes(arguments, expectedParameterTypes);
		}

		this.skipUpdate = skipUpdate;
		this.skipDraw = skipDraw;
	}

	Update() {
		throw new Error("Class " + this.constructor.name + " has no Update function implemented!");
	}

	Draw() {
		throw new Error("Class " + this.constructor.name + " has no Draw function implemented!");
	}
}