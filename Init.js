//Add code and function calls here that need to be executed on start.

//Basically makes the array return out of bounds indexes properly so that the array (almost) always returns a value instead of "undefined"
//Useful if "infinite" arrays are needed
Array.prototype.getLooping = function (index) {
	if (index < 0) {
		return this[((index % this.length) + this.length) % this.length]; //what
	}

	return this[index % this.length];
}

//Add event listener for browser window resizes and fullscreen changes and resize the canvas's container when it occurs
addEventListener("resize", ReSize);
addEventListener("fullscreenchange", ReSize);

//Create global game object
var game = new Game();

game.Start();