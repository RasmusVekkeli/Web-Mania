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

		this.currentScore = [[]];

		this.playStartTime = performance.now();

		this.objects;

		this.config = {};
		this.defaultConfig = {
			newUser: true,
			playfieldLaneWidth: 128,
			playfieldHitPosition: 200,
			playfieldDownScroll: true,
			playfieldScrollSpeedMult: 1,
			playfieldSpecialLane: true,
			playfieldSpecialLaneLeft: true,

			keys: [
				[],
				["Space"],
				["KeyX", "KeyM"],
				["KeyX", "Space", "KeyM"],
				["KeyZ", "KeyX", "KeyM", "Comma"],
				["KeyZ", "KeyX", "Space", "KeyM", "Comma"],
				["KeyZ", "KeyX", "KeyC", "KeyN", "KeyM", "Comma"],
				["KeyZ", "KeyX", "KeyC", "Space", "KeyN", "KeyM", "Comma"],
				["KeyZ", "KeyX", "KeyC", "ShiftLeft", "Space", "KeyN", "KeyM", "Comma"],
				["KeyZ", "KeyX", "KeyC", "KeyV", "Space", "KeyB", "KeyN", "KeyM", "Comma"]
			],
		};

		this.hitWindows = {
			marvelous: { hitWindow: 20, accValue: 100, judgeText: "Marvelous!!" },
			perfect: { hitWindow: 40, accValue: 100, judgeText: "Perfect!" },
			ok: { hitWindow: 60, accValue: 50, judgeText: "OK" },
			bad: { hitWindow: 80, accValue: 0, judgeText: "Bad" },
			miss: { hitWindow: 100, accValue: -20, judgeText: "Miss" }
		}

		this.lastJudgement = this.hitWindows.marvelous;
	}

	get aspectRatio() {
		return this.context.canvas.width / this.context.canvas.height;
	}

	get inverseAspectRatio() {
		return this.context.canvas.height / this.context.canvas.width;
	}

	HandleKeyDown(e) {
		switch (e.code) {
			default:
				if (game.currentChart !== null) {
					for (let i = 0; i < game.config.keys[game.currentChart.keyCount].length; i++) {
						if (e.code == game.config.keys[game.currentChart.keyCount][i]) {
							game.Judge(i);
							break;
						}
					}
				}
				break;
		}
	}

	HandleKeyUp(e) {
		switch (e.code) {
			default:
				if (game.currentChart !== null) {
					for (let i = 0; i < game.config.keys[game.currentChart.keyCount].length; i++) {
						if (e.code == game.config.keys[game.currentChart.keyCount][i]) {
							game.JudgeLNEnd(i);
							break;
						}
					}
				}
				break;
		}
	}

	Judge(lane) {
		if (game.currentChart.noteList[lane].length > game.currentScore[lane].length) {
			if (game.currentChart.noteList[lane][game.currentScore[lane].length].type !== 2) {
				let hitError = Math.abs(game.currentChart.noteList[lane][game.currentScore[lane].length].time - game.currentPlayTime);

				if (hitError < game.hitWindows.miss.hitWindow) {
					if (hitError < game.hitWindows.marvelous.hitWindow) {
						game.currentScore[lane].push(game.hitWindows.marvelous.accValue);
						game.lastJudgement = game.hitWindows.marvelous;
					}
					else if (hitError < game.hitWindows.perfect.hitWindow) {
						game.currentScore[lane].push(game.hitWindows.perfect.accValue);
						game.lastJudgement = game.hitWindows.perfect;
					}
					else if (hitError < game.hitWindows.ok.hitWindow) {
						game.currentScore[lane].push(game.hitWindows.ok.accValue);
						game.lastJudgement = game.hitWindows.ok;
					}
					else if (hitError < game.hitWindows.bad.hitWindow) {
						game.currentScore[lane].push(game.hitWindows.bad.accValue);
						game.lastJudgement = game.hitWindows.bad;
					}
					else {
						game.currentScore[lane].push(game.hitWindows.miss.accValue);
						game.lastJudgement = game.hitWindows.miss;

						if (game.currentChart.noteList[lane][game.currentScore[lane].length].type === 2) {
							game.currentScore[lane].push(game.hitWindows.miss.accValue);
						}
					}
				}
			}
		}
	}

	JudgeLNEnd(lane) {
		if (game.currentChart.noteList[lane].length > game.currentScore[lane].length) {
			if (game.currentChart.noteList[lane][game.currentScore[lane].length].type === 2) {
				let hitError = Math.abs(game.currentChart.noteList[lane][game.currentScore[lane].length].time - game.currentPlayTime);

				if (hitError < game.hitWindows.marvelous.hitWindow) {
					game.currentScore[lane].push(game.hitWindows.marvelous.accValue);
					game.lastJudgement = game.hitWindows.marvelous;
				}
				else if (hitError < game.hitWindows.perfect.hitWindow) {
					game.currentScore[lane].push(game.hitWindows.perfect.accValue);
					game.lastJudgement = game.hitWindows.perfect;
				}
				else if (hitError < game.hitWindows.ok.hitWindow) {
					game.currentScore[lane].push(game.hitWindows.ok.accValue);
					game.lastJudgement = game.hitWindows.ok;
				}
				else if (hitError < game.hitWindows.bad.hitWindow) {
					game.currentScore[lane].push(game.hitWindows.bad.accValue);
					game.lastJudgement = game.hitWindows.bad;
				}
				else {
					game.currentScore[lane].push(game.hitWindows.miss.accValue);
					game.lastJudgement = game.hitWindows.miss;
				}
			}
		}
	}

	LoadConfiguration() {
		this.config = {};

		this.config.unsaved = false;

		if (localStorage.getItem("newUser") !== null) {
			this.config.newUser = false;
		}
		else {
			this.config.newUser = this.defaultConfig.newUser;
			this.config.unsaved = true;
		}

		if (localStorage.getItem("playfieldLaneWidth") !== null) {
			this.config.playfieldLaneWidth = Number(localStorage.getItem("playfieldLaneWidth"));
		}
		else {
			this.config.playfieldLaneWidth = this.defaultConfig.playfieldLaneWidth;
			this.config.unsaved = true;
		}

		if (localStorage.getItem("playfieldHitPosition") !== null) {
			this.config.playfieldHitPosition = Number(localStorage.getItem("playfieldHitPosition"));
		}
		else {
			this.config.playfieldHitPosition = this.defaultConfig.playfieldHitPosition;
			this.config.unsaved = true;
		}

		if (localStorage.getItem("playfieldDownScroll") !== null) {
			this.config.playfieldDownScroll = Number(localStorage.getItem("playfieldDownScroll"));
		}
		else {
			this.config.playfieldDownScroll = this.defaultConfig.playfieldDownScroll;
			this.config.unsaved = true;
		}

		if (localStorage.getItem("playfieldScrollSpeedMult") !== null) {
			this.config.playfieldScrollSpeedMult = Number(localStorage.getItem("playfieldScrollSpeedMult"));
		}
		else {
			this.config.playfieldScrollSpeedMult = this.defaultConfig.playfieldScrollSpeedMult;
			this.config.unsaved = true;
		}

		if (localStorage.getItem("playfieldSpecialLane") !== null) {
			this.config.playfieldSpecialLane = Boolean(localStorage.getItem("playfieldSpecialLane"));
		}
		else {
			this.config.playfieldSpecialLane = this.defaultConfig.playfieldSpecialLane;
			this.config.unsaved = true;
		}

		if (localStorage.getItem("playfieldSpecialLaneLeft") !== null) {
			this.config.playfieldSpecialLaneLeft = Boolean(localStorage.getItem("playfieldSpecialLaneLeft"));
		}
		else {
			this.config.playfieldSpecialLaneLeft = this.defaultConfig.playfieldSpecialLaneLeft;
			this.config.unsaved = true;
		}

		this.config.keys = [];

		for (let i = 0; i < this.defaultConfig.keys.length; i++) {
			if (localStorage.getItem("keys" + i) !== null) {
				let tempString = localStorage.getItem("keys" + i);

				this.config.keys[i] = [];

				while (tempString.indexOf(",") != -1) {
					this.config.keys[i].push(tempString.substr(0, tempString.indexOf(",")));
					tempString = tempString.substr(tempString.indexOf(",") + 1);
				}
			}
			else {
				this.config.keys[i] = this.defaultConfig.keys[i].slice(0);
				this.config.unsaved = true;
			}
		}
	}

	SaveConfiguration() {
		if (this.config.unsaved) {
			localStorage.setItem("newUser", "false");
			localStorage.setItem("playfieldLaneWidth", String(this.config.playfieldLaneWidth));
			localStorage.setItem("playfieldHitPosition", String(this.config.playfieldHitPosition));
			localStorage.setItem("playfieldDownScroll", String(this.config.playfieldDownScroll));
			localStorage.setItem("playfieldScrollSpeedMult", String(this.config.playfieldScrollSpeedMult));
			localStorage.setItem("playfieldSpecialLane", String(this.config.playfieldSpecialLane));
			localStorage.setItem("playfieldSpecialLaneLeft", String(this.config.playfieldSpecialLaneLeft));

			//Store key strings
			for (let i = 0; i < this.defaultConfig.keys.length; i++) {
				let tempString = "";

				for (let j = 0; j < this.defaultConfig.keys[i].length; j++) {
					tempString += this.config.keys[i][j] + ",";
				}

				localStorage.setItem("keys" + i, tempString);
			}

			this.config.unsaved = false;
		}
	}

	Play(rate = 1.0) {
		//"this" won't work here either for some reason (or it might, i had an issue here earlier i fixed, haven't tested "this" yet)
		for (let i = 0; i < game.currentChart.noteList.length; i++) {
			for (let j = 0; j < game.currentChart.noteList[i].length; j++) {
				game.currentChart.noteList[i][j].time = game.currentChart.noteList[i][j].time / rate;
			}
		}

		for (let i = 0; i < game.currentChart.timingPoints.length; i++) {
			game.currentChart.timingPoints[i].time /= rate;
		}

		for (let i = 0; i < game.currentChart.scrollSpeedPoints.length; i++) {
			game.currentChart.scrollSpeedPoints[i].time /= rate;
		}

		game.currentScore = [];

		for (let i = 0; i < game.currentChart.keyCount; i++) {
			game.currentScore.push([]);
		}

		game.currentAudio.playbackRate = rate;
		game.currentAudio.currentTime = 0;

		game.playStartTime = performance.now();

		if (game.currentAudio !== null) {
			game.currentAudio.play();
		}
	}

	async LoadAndPlay(songIndex, chartName, rate = 1.0) {
		await this.LoadSong(songIndex, chartName);
		this.Play(rate);
	}

	Update() {
		this.currentPlayTime = performance.now() - this.playStartTime;

		if (this.currentChart !== null) {
			for (let i = 0; i < this.currentChart.keyCount; i++) {
				if (this.currentChart.noteList[i].length > this.currentScore[i].length) {
					if (this.currentChart.noteList[i][this.currentScore[i].length].time < this.currentPlayTime - this.hitWindows.miss.hitWindow) {
						this.currentScore[i].push(this.hitWindows.miss.accValue);
						this.lastJudgement = this.hitWindows.miss;
					}
				}
			}
		}
		
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

		this.LoadConfiguration();

		addEventListener("keydown", this.HandleKeyDown);
		addEventListener("keyup", this.HandleKeyUp);

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
			console.warn("No chart named " + chartName + " was found in song " + songIndex);
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

		game.currentScore = [];

		for (let i = 0; i < game.currentChart.keyCount; i++) {
			game.currentScore.push([]);
		}
	}
}