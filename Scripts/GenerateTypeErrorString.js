/*
 * Automatically generates an error string for TypeError exceptions
 * 
 * Function parameters:
 * parameters: array of parameters of the function that failed its type check
 * expectedParameters: array of expected parameters of the function that failed its type check
 * 
 * Return value: String
 * Returns a string which contains a list of received and expected parameters types
*/
function GenerateTypeErrorString(parameters, expectedParameters) {
	var errorString = "Expected";

	for (let i = 0; i < expectedParameters.length; i++) {
		errorString += " " + expectedParameters[i];
	}

	errorString += "; received";

	for (let i = 0; i < parameters.length; i++) {
		errorString += " " + typeof parameters[i];
	}

	errorString += ".";

	return errorString;
}