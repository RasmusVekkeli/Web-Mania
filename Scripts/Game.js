/*
 * Class for managing game states and global varables needed by game objects
 * 
 * context: Context-object for the game canvas. The canvas element can be accessed using this.context.canvas
 * directorySelector: Input HTML Element used to choose files. Note that this element won't be added to the document and is only accessed using JS.
 * 
 * Constructor parameters:
 * none
 * 
 * Getters:
 * aspectRatio: Returns canvas aspect ratio as number
 * inverseAspectRatio: Returns canvas inverse aspect ratio as number, might not be used 
*/
class Game {
	constructor() {
		//Get canvas's context and set its rendering with and height
		this.context = document.getElementById("game_canvas").getContext("2d");
		this.context.canvas.width = 1920;
		this.context.canvas.height = 1080;

		//Create HTML input element, set its type to "file" and enable directory selection
		this.directorySelector = document.createElement("input");
		this.directorySelector.type = "file";
		//Note! Only seems to work on Chrome, Edge and Firefox!
		this.directorySelector.webkitdirectory = true;

		this.songList = [];
	}

	get aspectRatio() {
		return this.context.canvas.width / this.context.canvas.height;
	}

	get inverseAspectRatio() {
		return this.context.canvas.height / this.context.canvas.width;
	}
}