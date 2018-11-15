/*
 * Class for managing game states and global varables needed by game objects
 * 
 * context: Context-object for the game canvas. The canvas element can be accessed using this.context.canvas
 * directorySelector: Input HTML Element used to choose files. Note that this element won't be added to the document and is only accessed using JS.
 * songList: Array of Song objects.
 * currentChart: A Chart object, which represents the current playing chart
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

		this.currentChart = null;
		this.currentAudio = null;
		this.currentBG = null;
	}

	get aspectRatio() {
		return this.context.canvas.width / this.context.canvas.height;
	}

	get inverseAspectRatio() {
		return this.context.canvas.height / this.context.canvas.width;
	}

	async LoadSong(songIndex, chartName) {
		var chart = null;

		for (let i = 0; i < game.songList[songIndex].chartList.length; i++) {
			if (game.songList[songIndex].chartList[i].chartName == chartName) {
				chart = game.songList[songIndex].chartList[i];
				break;
			}
		}

		if (chart === null) {
			return false;
		}

		let object = this;

		let chartPromise = Chart.ParseOsuFile(chart.dataIndex);

		let bgPromise = new Promise(function (resolve, reject) {
			URL.revokeObjectURL(object.currentBG);

			if (chart.bgIndex !== null) {
				let tempBg = new Image();

				tempBg.onload = function () {
					object.currentBG = tempBg;
					resolve();
				}

				tempBg.src = URL.createObjectURL(game.directorySelector.files[chart.bgIndex]);
			}
			else {
				object.currentBG = null;
				resolve();
			}
		});

		let audioPromise = new Promise(function (resolve, reject) {
			URL.revokeObjectURL(object.currentAudio);

			if (chart.audioIndex !== null) {
				let tempAudio = new Audio();

				//Because why would it be the same as above?
				tempAudio.onloadeddata = function () {
					object.currentAudio = tempAudio;
					resolve();
				}

				tempAudio.src = URL.createObjectURL(game.directorySelector.files[chart.audioIndex]);
			}
			else {
				object.currentAudio = null;
				resolve();
			}
		});

		await bgPromise;
		await audioPromise;
		this.currentChart = await chartPromise;
	}
}