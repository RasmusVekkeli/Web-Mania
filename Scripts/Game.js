/*
 * Class for managing game states and global varables needed by game objects
 * 
 * gameCanvas: HTMLElement-object for the game canvas
 * context: context-object for the game canvas
 * 
 * Constructor parameters:
 * none
*/
class Game {
	constructor() {
		this.gameCanvas = document.getElementById("game_canvas");
		this.context = this.gameCanvas.getContext("2d");
	}
}