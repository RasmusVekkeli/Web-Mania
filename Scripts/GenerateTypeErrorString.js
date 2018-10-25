/*
 * Automatically generates an error string for TypeError exceptions
 * 
 * Function parameters:
 * parameters: array of parameters of the function that failed its type check
 * expectedParameterTypes: array of expected parameter types of the function that failed its type check. See the list of acceptable strings in TypeOf.js
 * 
 * Return value: String
 * Returns a string which contains a list of received and expected parameters types
*/
function GenerateTypeErrorString(parameters, expectedParameterTypes) {
	var errorString = "Expected";

	for (let i = 0; i < expectedParameterTypes.length; i++) {
		if (i != 0) {
			errorString += ",";
		}

		errorString += " <" + expectedParameterTypes[i] + ">";
	}

	errorString += "; received";

	for (let i = 0; i < parameters.length; i++) {
		if (i != 0) {
			errorString += ",";
		}

		errorString += " <" + TypeOf(parameters[i]) + ">";
	}

	errorString += ".";

	return errorString;
}