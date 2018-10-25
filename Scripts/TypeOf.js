/*
 * Returns type of the parameter as string
 * 
 * Function parameters:
 * value: any value that needs evaluation
 * 
 * Return type: String
 * Returns the type of value as string
 * 
 * Possible returns:
 * "undefined"
 * "number"
 * "string"
 * "null"
 * "object"
 * "array"
 * "function"
 * + any that typeof operator can return that I forgot to list here
*/
function TypeOf(value) {
	switch (typeof value) {
		case "object":
			if (value == null) {
				return "null";
			}
			else if (value instanceof Array) {
				return "array";
			}
			else if (value instanceof Object) {
				return "object";
			}

			break;

		default:
			return typeof value;
			break;
	}
}