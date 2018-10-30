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
	}
}