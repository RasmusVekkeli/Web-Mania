/*
 * Automatically generates an error string for TypeError exceptions, probably should not be called outside of validation functions
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
		//This is kinda badly written way to generate the string but it works, might rewrite in the future if I care enough
		if (i != 0) {
			errorString += ",";
		}

		if (TypeOf(expectedParameterTypes[i]) == "array") {
			for (let j = 0; j < expectedParameterTypes[i].length; j++) {
				errorString += " <" + expectedParameterTypes[i][j] + ">";

				if (j + 1 < expectedParameterTypes[i].length) {
					errorString += " or";
				}
			}
		}
		else {
			errorString += " <" + expectedParameterTypes[i] + ">";
		}
	}

	errorString += ";\n Received";

	if (parameters.length == 0) {
		errorString += " no parameters";
	}

	for (let i = 0; i < parameters.length; i++) {
		if (i != 0) {
			errorString += ",";
		}

		errorString += " <" + TypeOf(parameters[i]) + ">";
	}

	errorString += ".";

	return errorString;
}