/*
 * Class for managing game states and global varables needed by game objects
 * 
 * context: context-object for the game canvas. The canvas element can be accessed using game.context.canvas
 * 
 * Constructor parameters:
 * none
*/
class Game {
	constructor() {
		this.context = document.getElementById("game_canvas").getContext("2d");
		this.context.canvas.width = 1920;
		this.context.canvas.height = 1080;
	}

	get aspectRatio() {
		return this.context.canvas.width / this.context.canvas.height;
	}

	get inverseAspectRatio() {
		return this.context.canvas.height / this.context.canvas.width;
	}
}