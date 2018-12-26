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

		this.currentTimingSection = 0;

		this.judgeOffset = 0;
		this.universalOffset = -40;
		this.showFPS = true;

		this.playDelay = 3000;

		this.state = 0;
		/*
		 * States:
		 * 0: Initial State
		 * 1: Waiting for browser to generate file list
		 * 2: Generating song list
		 * 3: Song selection menu
		 * 4: In game
		 * 5: Results
		*/

		this.deltaTime = 0;
		this.lastTime = 0;

		this.lastFPS = 0;
		this.FPScounter = 0;
		this.nextFPSUpdate = 0;

		this.currentScore = [[]];
		this.currentCombo = 0;

		this.playStartTime = performance.now();

		this.objectLayers;

		this.config = {};
		this.defaultConfig = {
			keyConfigs: [
				new KeyConfig(	//Global config (index 0), other configs copy missing parameters from this one
					[],			//Keys for lanes (button config)
					128,		//Lane width
					160,		//Hit position
					true,		//Down scroll (true: notes go from top to bottom)
					2.3,		//Scroll speed multiplier (1: notes move 1000 pixels per second)
					false,		//Special lane, not yet implemented
					true,		//Special lane side (true: left)
					30,			//Note height for bar notes, should be rewritten to get from a noteskin object
					null,		//Noteskin object to be used, noteskins not yet implemented
					[],			//Note snap colours, not yet implemented
					50,			//Height of the beat line
					"#FFFFFF"	//Colour of the beat line
				),

				//Rest will copy other settings from the global config apart from keys
				new KeyConfig(["Space"]),
				new KeyConfig(["KeyX", "KeyM"]),
				new KeyConfig(["KeyX", "Space", "KeyM"]),
				new KeyConfig(["KeyZ", "KeyX", "KeyM", "Comma"]),
				new KeyConfig(["KeyZ", "KeyX", "Space", "KeyM", "Comma"]),
				new KeyConfig(["KeyZ", "KeyX", "KeyC", "KeyN", "KeyM", "Comma"]),
				new KeyConfig(["KeyZ", "KeyX", "KeyC", "Space", "KeyN", "KeyM", "Comma"]),
				new KeyConfig(["KeyZ", "KeyX", "KeyC", "ShiftLeft", "Space", "KeyN", "KeyM", "Comma"]),
				new KeyConfig(["KeyZ", "KeyX", "KeyC", "KeyV", "Space", "KeyB", "KeyN", "KeyM", "Comma"]),
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

	get beatT() {
		//Calculate milliseconds per beat from bpm
		let mspb = 60000 / this.currentChart.timingPoints[this.currentTimingSection].bpm;

		let t = (this.currentPlayTime - this.currentChart.timingPoints[this.currentTimingSection].time) % mspb / mspb;

		if (t < 0) {
			t = 0;
		}

		if (t > 1) {
			t = 1; 
		}

		return t;
	}

	get currentKeyConfig() {
		let tempConfig = JSON.parse(JSON.stringify(this.config.keyConfigs[0]));

		if (this.currentChart !== null) {
			Object.assign(tempConfig, this.config.keyConfigs[this.currentChart.keyCount]);
		}

		return tempConfig;
	}

	UpdateFPS() {
		this.lastFPS = this.FPScounter;
		this.FPScounter = 0;
		this.fpsText.text = this.lastFPS;
	}

	IncrementCombo() {
		this.currentCombo++;
		this.comboText.Animate();
	}

	HandleKeyDown(e) {
		switch (e.code) {
			case "Enter":
				game.Play();

				break;

			default:
				if (game.state === 4) {
					for (let i = 0; i < game.currentKeyConfig.keys.length; i++) {
						if (e.code == game.currentKeyConfig.keys[i]) {
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
				if (game.state === 4) {
					for (let i = 0; i < game.currentKeyConfig.keys.length; i++) {
						if (e.code == game.currentKeyConfig.keys[i]) {
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
				let hitError = Math.abs(game.currentChart.noteList[lane][game.currentScore[lane].length].time - game.currentPlayTime + game.judgeOffset);

				if (hitError < game.hitWindows.miss.hitWindow) {
					if (hitError < game.hitWindows.marvelous.hitWindow) {
						game.currentScore[lane].push(game.hitWindows.marvelous.accValue);
						game.lastJudgement = game.hitWindows.marvelous;
						game.IncrementCombo();
					}
					else if (hitError < game.hitWindows.perfect.hitWindow) {
						game.currentScore[lane].push(game.hitWindows.perfect.accValue);
						game.lastJudgement = game.hitWindows.perfect;
						game.IncrementCombo();
					}
					else if (hitError < game.hitWindows.ok.hitWindow) {
						game.currentScore[lane].push(game.hitWindows.ok.accValue);
						game.lastJudgement = game.hitWindows.ok;
						game.IncrementCombo();
					}
					else if (hitError < game.hitWindows.bad.hitWindow) {
						game.currentScore[lane].push(game.hitWindows.bad.accValue);
						game.lastJudgement = game.hitWindows.bad;
						game.IncrementCombo();
					}
					else {
						game.currentScore[lane].push(game.hitWindows.miss.accValue);
						game.lastJudgement = game.hitWindows.miss;
						game.currentCombo = 0;

						if (game.currentChart.noteList[lane][game.currentScore[lane].length].type === 2) {
							game.currentScore[lane].push(game.hitWindows.miss.accValue);
						}
					}

					game.judgementText.Animate();
				}
			}
		}
	}

	JudgeLNEnd(lane) {
		if (game.currentChart.noteList[lane].length > game.currentScore[lane].length) {
			if (game.currentChart.noteList[lane][game.currentScore[lane].length].type === 2) {
				let hitError = Math.abs(game.currentChart.noteList[lane][game.currentScore[lane].length].time - game.currentPlayTime + game.judgeOffset);

				if (hitError < game.hitWindows.marvelous.hitWindow) {
					game.currentScore[lane].push(game.hitWindows.marvelous.accValue);
					game.lastJudgement = game.hitWindows.marvelous;
					game.IncrementCombo();
				}
				else if (hitError < game.hitWindows.perfect.hitWindow) {
					game.currentScore[lane].push(game.hitWindows.perfect.accValue);
					game.lastJudgement = game.hitWindows.perfect;
					game.IncrementCombo();
				}
				else if (hitError < game.hitWindows.ok.hitWindow) {
					game.currentScore[lane].push(game.hitWindows.ok.accValue);
					game.lastJudgement = game.hitWindows.ok;
					game.IncrementCombo();
				}
				else if (hitError < game.hitWindows.bad.hitWindow) {
					game.currentScore[lane].push(game.hitWindows.bad.accValue);
					game.lastJudgement = game.hitWindows.bad;
					game.IncrementCombo();
				}
				else {
					game.currentScore[lane].push(game.hitWindows.miss.accValue);
					game.lastJudgement = game.hitWindows.miss;
					game.currentCombo = 0;
				}
			}
		}
	}

	LoadConfiguration() {
		this.config = JSON.parse(JSON.stringify(this.defaultConfig));

		Object.assign(this.config, JSON.parse(localStorage.getItem("gameConfig")));
	}

	SaveConfiguration() {
		localStorage.setItem("gameConfig", JSON.stringify(game.config));
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

		game.currentCombo = 0;

		game.currentAudio.playbackRate = rate;
		game.currentAudio.currentTime = 0;

		game.state = 4;
		game.playStartTime = performance.now() + this.playDelay + this.universalOffset;

		game.currentTimingSection = 0;

		if (game.currentAudio !== null) {
			setTimeout(function () { game.currentAudio.play(); }, game.playDelay);
		}
	}

	Stop() {
		game.state = 5;
	}

	async LoadAndPlay(songIndex, chartName, rate = 1.0) {
		await this.LoadSong(songIndex, chartName);
		this.Play(rate);
	}

	Update() {
		this.currentPlayTime = performance.now() - this.playStartTime;

		this.deltaTime = performance.now() - this.lastTime;
		this.lastTime = performance.now();

		if (this.state === 4) {
			for (let i = 0; i < this.currentChart.keyCount; i++) {
				if (this.currentChart.noteList[i].length > this.currentScore[i].length) {
					if (this.currentChart.noteList[i][this.currentScore[i].length].time < this.currentPlayTime - this.hitWindows.miss.hitWindow) {
						this.currentScore[i].push(this.hitWindows.miss.accValue);
						this.lastJudgement = this.hitWindows.miss;
						this.currentCombo = 0;
					}
				}

				if (this.currentChart.lastNote.time < this.currentPlayTime - 3000) {
					this.Stop();
				}
			}

			while (this.currentTimingSection < this.currentChart.timingPoints.length - 1) {
				if (this.currentChart.timingPoints[this.currentTimingSection + 1].time < this.currentPlayTime) {
					this.currentTimingSection++;
				}
				else {
					break;
				}
			}
		}

		//Updates!!////////////////////////////////////////////////////
		for (let i = 0; i < this.objectLayers.length; i++) {
			this.objectLayers[i].Update();
		}

		//Update FPS of last second
		if (this.nextFPSUpdate * 1000 < performance.now()) {
			this.UpdateFPS();
			this.nextFPSUpdate++;
		}
	}

	Draw() {
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

		for (let i = 0; i < this.objectLayers.length; i++) {
			this.objectLayers[i].Draw();
		}

		//Increment FPS counter
		this.FPScounter++;
	}

	Tick() {
		//I have no idea why I can't use "this" here
		game.Update();
		game.Draw();
	}

	Start() {
		this.LoadConfiguration();

		this.objectLayers = [
			new Layer("bgLayer", [new BGImage(null, false, false, true)]),
			new Layer("playfieldLayer", [new Playfield()]),
			new Layer("playfieldUILayer", [new JudgementText(), new Combo()]),
			new Layer("debugUILayer", [new UIText("", 10, 10, -1, -1, 30, "Arial")]),
		];

		//Set up easier to access references to objects
		this.bgImage = this.GetLayerByName("bgLayer").objectList[0];
		this.playfield = this.GetLayerByName("playfieldLayer").objectList[0];

		this.judgementText = this.GetLayerByName("playfieldUILayer").objectList[0];
		this.comboText = this.GetLayerByName("playfieldUILayer").objectList[1];

		this.fpsText = this.GetLayerByName("debugUILayer").objectList[0];

		addEventListener("keydown", this.HandleKeyDown);
		addEventListener("keyup", this.HandleKeyUp);

		//Intervals are unfortunately capped at 4 ms (250 intervals per second). There seems to be no workarounds for this
		this.tickInterval = setInterval(this.Tick);
	}

	GetLayerByName(name) {
		for (let i = 0; i < this.objectLayers.length; i++) {
			if (this.objectLayers[i].name == name) {
				return this.objectLayers[i];
			}
		}

		return false;
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

		this.bgImage.UpdateBGImage();

		game.currentScore = [];

		for (let i = 0; i < game.currentChart.keyCount; i++) {
			game.currentScore.push([]);
		}
	}
}