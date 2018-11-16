/*
 * Class for managing game states and global varables needed by game objects
 * 
 * context: Context-object for the game canvas. The canvas element can be accessed using this.context.canvas
 * directorySelector: Input HTML Element used to choose files. Note that this element won't be added to the document and is only accessed using JS.
 * songList: Array of Song objects.
 * currentChart: A Chart object, which represents the current playing chart
 * currentAudio: An Audio object, which contains loaded audio file of the current chart, or null if no such file exists
 * currentBG: An Image object, which contains loaded image file of the current chart, of null if no such file exists
 * playStartTime: Time stamp which tracks when the chart started playing
 * objects: Array of objects which need rendering and/or updating
 * 
 * Constructor parameters:
 * none
 * 
 * Getters:
 * aspectRatio: Returns canvas aspect ratio as number
 * inverseAspectRatio: Returns canvas inverse aspect ratio as number, might not be used 
 * 
 * Functions: 
 * Play: Resets timers and starts the current chart for playing
 * 
 * Parameters: none
 * 
 * Return value: none
 * 
 * 
 * Update: Calls Update on each element of "objects" array
 * 
 * Parameters: none
 * 
 * Return value: none
 * 
 * 
 * Draw: Calls Draw on each element of "objects" array
 * 
 * Parameters: none
 * 
 * Return value: none
 * 
 * 
 * Tick: Calls Update and Draw on the game object
 * 
 * Parameters: none
 * 
 * Return value: none
 * 
 * 
 * Start: Initializes some variables that can't be initialized in contructor and starts tick interval
 * 
 * Parameters: none
 * 
 * Return value: none
 * 
 * 
 * LoadSong: Loads files of a single chart into variables
 * 
 * Parameters: 
 * songIndex: Index of a Song object in the songList array
 * chartName: Name of the chart desired. 
 * 
 * Return value: false if loading fails, none otherwise.
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

		this.playStartTime = performance.now();

		this.objects;
	}

	get aspectRatio() {
		return this.context.canvas.width / this.context.canvas.height;
	}

	get inverseAspectRatio() {
		return this.context.canvas.height / this.context.canvas.width;
	}

	Play() {
		this.playStartTime = performance.now();

		if (this.currentAudio !== null) {
			this.currentAudio.play();
		}
	}

	Update() {
		this.currentPlayTime = performance.now() - this.playStartTime;

		for (let i = 0; i < this.objects.length; i++) {
			this.objects[i].Update();
		}
	}

	Draw() {
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

		for (let i = 0; i < this.objects.length; i++) {
			this.objects[i].Draw();
		}
	}

	Tick() {
		//I have no idea why I can't use "this" here
		game.Update();
		game.Draw();
	}

	Start() {
		this.objects = [
			new BGImage(null, false, false, true),
			new Playfield(),
		];

		this.tickInterval = setInterval(this.Tick);
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

		this.objects[0].UpdateBGImage();
	}
}