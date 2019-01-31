/*
 * Class for managing game states and global varables needed by game objects
 * 
 * Properties:
 * context: a 2D context-object for the game canvas. The canvas element can be accessed using this.context.canvas
 * directorySelector: Input HTML Element used to choose files. Note that this element won't be added to the document and is only accessed using JS.
 * 
 * songList: Array of Song objects.
 * currentChart: A Chart object, which represents the current playing chart
 * currentAudio: An Audio object, which contains loaded audio file of the current chart, or null if no such file exists
 * currentBG: An Image object, which contains loaded image file of the current chart, of null if no such file exists
 * currentTimingSection: A value which holds the index to the current timing section of the current chart
 * 
 * judgeOffset: A value which is added to currentTime when checking for hits
 * universalOffset: A value which is added to playStartTime at when the chart is started using the Play function. This effectively offsets notes to the music.
 * showFPS: Toggles fps text
 * 
 * playDelay: Delays the start of the chart by this many milliseconds. Is done to avoid the charts starting too fast after the Play function is called.
 * state: Holds the current screen the game is at. States are listed next to the variable below
 * 
 * deltaTime: Holds the time difference between current and last frame. Unused.
 * lastTime: Holds the timestamp of the last frame. Used for calculating deltaTime.
 * lastFPS: Holds the FPS value of the last second. This value is displayed on the UI.
 * FPScounter: Holds the frame count for the current second.
 * nextFPSUpdate: Holds the second (note: not millisecond) where lastFPS will be set to the value of FPScounter. FPScounter will be cleared.
 * 
 * currentScore: A 2 dimensional array which holds judgements for each note. First dimension is for note lane, second is for the individual note. Both dimensions' maximum length should be equal to the dimensions' of the noteList of currentChart.
 * currentCombo: Holds the current combo value. Gets set to 0 on start of chart or missing a note.
 * playStartTime: Time stamp which tracks when the chart started playing
 * 
 * objectLayers: An array containing Layer objects. Each layer contains object(s) which have Update and Draw functions, which are called each frame if layers are not set to skip these.
 * autoPlay: Toggles automatic play of the game. Autoplay will hit every note with Marvelous judgement.
 * 
 * currentProgress: A value representing current progress of chart list generation.
 * endProgress: A value representing all possible progress of chart list generation. Effectively the lenght of the file list.
 * 
 * config: Holds an object filled with settings used for preferences. Gets set by LoadConfiguration function at the start of the game and gets saved as JSON to localStorage with SaveConfiguration function.
 * defaultConfig: Holds an object filled with default settings used for preferences. This object should not be chaged on runtime.
 * 
 * hitWindows: Holds all judgements and their hit windows.
 * lastJudgement: Holds a reference to the last judgement of gameplay. Is set by Judge function or Update function.
 * 
 * bgImage: A reference to BGImage object. This object is used to draw the chart background image.
 * playfield: A reference to Playfield object. This object is used to draw the playfield and its notes.
 * judgementText: A reference to JudgementText object. This object is used to draw the judgment text of the last hit (or missed) note.
 * comboText: A reference to Combo object. This object is used to draw the current combo number and the "COMBO" text under it.
 * songWheel: A reference to SongWheel object. This object is used to draw the song selection wheel.
 * fpsText: A reference to UIText object. This object is used to draw the FPS number at the top left of the screen.
 * 
 * tickInterval: An interval ID of the tick. This interval runs as many times as possible (capped at 4ms between each tick).
 * 
 * Constructor parameters:
 * none
 * 
 * Getters:
 * aspectRatio: Returns canvas aspect ratio as number
 * inverseAspectRatio: Returns canvas inverse aspect ratio as number, might not be used 
 * beatT: Returns a linear interpolation value between 0 and 1 based on the current time and BPM of the current timing section.
 * currentKeyConfig: Returns a key specific config object for the keyCount of the currentChart, which is created by overwriting global keyconfig values with the key specific ones.
 * 
 * Functions: 
 * UpdateFPS: Sets lastFPS to the value of FPScounter, sets FPScouter to 0, sets FPS and increments nextFPSUpdate by 1.
 * Parameters: none
 * 
 * IncrementCombo: Adds 1 to currentCombo and sets the comboText object to animate.
 * Parameters: none
 * 
 * HandleChange: Event handler for directorySelector.change event. Changes game state to 2 (generating song list) and start song list generation.
 * Parameters: 
 * e: The Change event object passed by the event itself.
 * 
 * HandleKeyDown: Event handler for the user pressing keys down on the keyboard. Does different things depending on the game state. Basically does things (or ignores keypresses) when user hits the keyboard.
 * Parameters:
 * e: The KeyDown event object passed by the event itself.
 * 
 * HandleKeyUp: Event handler for user releasing pressed keys. Is only used for detecting released long notes (note: long note releases are timed as judgements).
 * Parameters:
 * e: The KeyUp event object passed by the event itself.
 * 
 * Judge: Processes scoring of a note hit and stores the result in the currentScore array. Won't do anything if autoPlay is set to true.
 * Parameters:
 * lane: The lane the judgement is for. 
 * 
 * JudgeLNEnd: Processes scoring of a long note released and stores the result in currentScore array. Won't do anything if autoPlay is set to true.
 * Parameters:
 * lane: The lane the judgement is for.
 * 
 * LoadConfiguration: Clones defaultConfig object to config and fetches non default configs (as JSON string) from localStorage and overwrites the config object with it.
 * Parameters: none
 * 
 * SaveConfiguration: Saves config object as JSON string into localStorage.
 * Parameters: none
 * 
 * Play: Starts the gameplay for the current loaded chart. Also makes note calculations based on the inserted rate.
 * Parameters:
 * rate: The rate the chart should be played on.
 * 
 * Stop: Sets game state to "song selection". Effectively hides the playfield and shows the songwheel.
 * Parameters: none
 * 
 * Update: Runs code unrelated to drawing that needs to be ran each frame. Check the funtion itself for specifics.
 * Parameters: none
 * 
 * Draw: Runs code related to drawing (and the drawing code itself) each frame.
 * Parameters: none
 * 
 * Tick: Calls Update and Draw functions.
 * Parameters: none
 * 
 * Start: Initializes object layers and adds event listeners + some other necessary code that couldn't be ran in the constructor for some reason.
 * Parameters: none
 * 
 * GetLayerByName: Returns a reference to Layer object whose name matches. Returns false if no matches were found.
 * Parameters:
 * name: A string of the name of the layer.
 * 
 * LoadSong: Loads and parses the chart file into a Chart object, loads bg image and audio files and sets them to currentChart, currentBG and currentAudio variables.
 * Parameters:
 * songIndex: Index of the song in the songList array.
 * chartI: Index of the chart in chartList array of a Song object, or name of the chart in chartList array of a Song object.
 * 
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
		this.universalOffset = 90;
		this.showFPS = true;

		this.playDelay = 3000;

		this.state = 0;
		/*
		 * States:
		 * 0: Initial State
		 * 1: Waiting for browser to generate file list (unused due to impossibility to detect when the browser is doing so)
		 * 2: Generating song list
		 * 3: Song selection menu
		 * 4: In game
		 * 5: Results (unused since no result screen is currently implemented)
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

		this.autoPlay = false;

		this.currentProgress = 0;
		this.endProgress = 0;

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
        };

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

	HandleChange(e) {
		game.state = 2;
		GenerateSongList();
	}

	HandleKeyDown(e) {
		switch (game.state) {
			case 0:
				switch (e.code) {
					case "Enter":
						game.directorySelector.click();
						break;
				}
				break;

			case 1:
				break;

			case 2:
				break;

			case 3:
				switch (e.code) {
					case "ArrowRight":
						game.songWheel.relativeSongSelectionIndex = 1;
						break;

					case "ArrowLeft":
						game.songWheel.relativeSongSelectionIndex = -1;
						break;

					case "ArrowDown":
						game.songWheel.relativeDiffSelectionIndex = 1;
						break;

					case "ArrowUp":
						game.songWheel.relativeDiffSelectionIndex = -1;
						break;

					case "Enter":
						game.songWheel.Selecter();
						break;
				}

				break;

			case 4:
				//We should only care about keys that are just pressed, not held down
				if (e.repeat) {
					return;
				}

				switch (e.code) {
					default:
						//Handle lane keys
						for (let i = 0; i < game.currentKeyConfig.keys.length; i++) {
							if (e.code == game.currentKeyConfig.keys[i]) {
								game.Judge(i);
								break;
							}
						}
						
						break;
				}
				
				break;

			case 5:
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
		if (this.autoPlay) {
			return;
		}

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
		if (this.autoPlay) {
			return;
		}

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
		//Copy original note lists to the working note lists
		game.currentChart.noteList = JSON.parse(JSON.stringify(game.currentChart.originalNoteList));
		game.currentChart.scrollSpeedPoints = JSON.parse(JSON.stringify(game.currentChart.originalScrollSpeedPoints));
		game.currentChart.timingPoints = JSON.parse(JSON.stringify(game.currentChart.originalTimingPoints));

		//"this" won't work here either for some reason (or it might, i had an issue here earlier i fixed, haven't tested "this" yet)
		for (let i = 0; i < game.currentChart.noteList.length; i++) {
			for (let j = 0; j < game.currentChart.noteList[i].length; j++) {
				game.currentChart.noteList[i][j].time = game.currentChart.noteList[i][j].time / rate;
			}
		}

		for (let i = 0; i < game.currentChart.timingPoints.length; i++) {
			game.currentChart.timingPoints[i].time /= rate;
			game.currentChart.timingPoints[i].bpm *= rate;
		}

		for (let i = 0; i < game.currentChart.scrollSpeedPoints.length; i++) {
			game.currentChart.scrollSpeedPoints[i].time /= rate;
		}

		game.currentScore = [];
		game.playfield.nextNoteIndex = [];

		for (let i = 0; i < game.currentChart.keyCount; i++) {
			game.currentScore.push([]);
			game.playfield.nextNoteIndex.push(0);
		}

		game.currentCombo = 0;

		game.state = 4;
		game.playStartTime = performance.now() + this.playDelay + this.universalOffset;

		game.currentTimingSection = 0;

		if (game.currentAudio !== null) {
			game.currentAudio.pause();
			game.currentAudio.playbackRate = rate;
			game.currentAudio.currentTime = 0;

			setTimeout(function () { game.currentAudio.play(); }, game.playDelay);
		}
	}

	Stop() {
		game.state = 3;
	}

	Update() {
		this.currentPlayTime = performance.now() - this.playStartTime;

		this.deltaTime = performance.now() - this.lastTime;
		this.lastTime = performance.now();

		if (this.state !== 0) {
			this.objectLayers[0].skipDraw = true;

			if (this.state !== 2) {
				this.objectLayers[1].skipDraw = true;
			}
		}

		if (this.state === 4) {
			for (let i = 0; i < this.currentChart.keyCount; i++) {
				if (this.currentChart.noteList[i].length > this.currentScore[i].length) {
					// Auto-play
					if (this.autoPlay) {
						if (this.currentChart.noteList[i][this.currentScore[i].length].time <= this.currentPlayTime) {
							game.currentScore[i].push(game.hitWindows.marvelous.accValue);
							game.lastJudgement = game.hitWindows.marvelous;
							game.IncrementCombo();
							game.judgementText.Animate();
						}
					} else { // Check for missed notes
						if (this.currentChart.noteList[i][this.currentScore[i].length].time < this.currentPlayTime - this.hitWindows.miss.hitWindow) {
							this.currentScore[i].push(this.hitWindows.miss.accValue);
							this.lastJudgement = this.hitWindows.miss;
							this.currentCombo = 0;
						}
					}
				}

				//Check for end of chart
				if (this.currentChart.lastNote.time < this.currentPlayTime - 3000) {
					this.Stop();
				}
			}

			//Update current timing section
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
		//Clear screen
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

		//Draws!!/////////////////////////////////////////////////////
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
		//Load config objects
		this.LoadConfiguration();

		//Setup objectlayers
		this.objectLayers = [
			new Layer("startInstructionLayer", [ //Contains the text of the first screen. Probably better ways to do this but this works for now.
				new UIText("Welcome!", this.context.canvas.width / 2, 10, 0, -1, 90),
				new UIText("Instructions to start:", 10, 120, -1, -1, 40),
				new UIText("1. When prompted, choose a folder that contains your osu! beatmaps.", 10, 170, -1, -1, 40),
				new UIText("2. Wait for your files to get loaded into your browser. This will take up to couple of minutes.", 10, 250, -1, -1, 40),
				new UIText("Your browser might be unresponsive during the loading.", 10, 300, -1, -1, 40),
				new UIText("3. When the loading is done, the program will start parsing the files.", 10, 380, -1, -1, 40),
				new UIText("The progress of parsing is indicated by a progress bar.", 10, 430, -1, -1, 40), 
				new UIText("Press Enter to start.", this.context.canvas.width / 2, this.context.canvas.height - 10, 0, 1, 90),
			]),
			new Layer("songListGeneratorLayer", [new ProgressBar(new Rect(100, this.context.canvas.height - 100, this.context.canvas.width - 200, 60, true), "#FFFFFF")]), //Generator screen. Only contains the progress bar.
			new Layer("bgLayer", [new BGImage(null, false, false, true)]), //Background image layer
			new Layer("playfieldLayer", [new Playfield()]),	//Playfield layer
			new Layer("playfieldUILayer", [new JudgementText(), new Combo()]), //Playfield UI layer (combo, judgement text)
			new Layer("songSelectUILayer", [new SongWheel()]), //Songwheel layer
			new Layer("debugUILayer", [new UIText("", 10, 10, -1, -1, 30, "Arial")]), //FPS text layer
		];

		//Set up easier to access references to objects
		this.bgImage = this.GetLayerByName("bgLayer").objectList[0];
		this.playfield = this.GetLayerByName("playfieldLayer").objectList[0];

		this.judgementText = this.GetLayerByName("playfieldUILayer").objectList[0];
		this.comboText = this.GetLayerByName("playfieldUILayer").objectList[1];

		this.songWheel = this.GetLayerByName("songSelectUILayer").objectList[0];

		this.fpsText = this.GetLayerByName("debugUILayer").objectList[0];
		this.fpsText.textStyle = "#FFFFFF";

		//Add event listeners to key presses and releases
		addEventListener("keydown", this.HandleKeyDown);
		addEventListener("keyup", this.HandleKeyUp);

		this.directorySelector.addEventListener("change", this.HandleChange);

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

	async LoadSong(songIndex, chartI) {
		var chart = null;

		if (TypeOf(chartI) == "number") {
			chart = game.songList.getLooping(songIndex).chartList[chartI];

			if (chart === undefined) {
				console.warn("No chart exists in chartList index " + chartI + " of song " + songIndex);
			}
		}
		else {
			for (let i = 0; i < game.songList.getLooping(songIndex).chartList.length; i++) {
				if (game.songList.getLooping(songIndex).chartList[i].chartName == chartI) {
					chart = game.songList.getLooping(songIndex).chartList[i];
					break;
				}
			}

			if (chart === null) {
				console.warn("No chart named " + chart + " was found in song " + songIndex);
				return false;
			}
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

		game.playfield.ReloadPlayfieldParameters();
	}
}