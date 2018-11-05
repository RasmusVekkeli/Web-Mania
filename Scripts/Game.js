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
 * 
 * Functions:
 * TrimPathString: Trims the filename at the end of a relative path string to get relative directory path
 * 
 * TrimPathString parameters:
 * relativePath: Relative path string which needs trimming
 * 
 * Return value: Relative path to the directory of the file 
 * 
 * 
 * FetchMetadataStringFromOsuFile: Returns the metadata section of a .osu file as string
 * 
 * FetchMetadataStringFromOsuFile parameters:
 * fileIndex: Index of the file in the directorySelector.files list
 * 
 * Return value: String which contains the entire Metadata section
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

		this.directorySelector.addEventListener("change", this.GenerateSongList());

		this.songList = [];
	}

	get aspectRatio() {
		return this.context.canvas.width / this.context.canvas.height;
	}

	get inverseAspectRatio() {
		return this.context.canvas.height / this.context.canvas.width;
	}

	async FetchMetadataStringFromOsuFile(fileIndex) {
		var reader = new FileReader();
		var directorySelector = this.directorySelector;

		var promise = new Promise(function (resolve, reject) {
			reader.onload = function () { resolve() };
			reader.onerror = function () { reject() };
			reader.readAsText(directorySelector.files[fileIndex]);
		});

		await promise;

		return reader.result.match(/\[Metadata\][^\[]*/);
	}

	TrimPathString(relativePath) {
		return relativePath.substr(0, relativePath.lastIndexOf("/") + 1);
	}
}