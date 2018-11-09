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
 * 
 * Functions:
 * GenerateSongList: Populates songList array with Song objects by parsing the directorySelector.files array
 * 
 * GenerateSongList parameters:
 * clearList: clears the songList if true. True by default
 * 
 * Return value: none
 * 
 * FindOsuFile: Finds .osu file in a directory. Should probably use FindFileInFileList function instead.
 * 
 * FindOsuFile parameters:
 * directoryStart: index of the first file in the directory
 * directoryEnd: index of the first file in the next directory (a.k.a. last file of directory + 1)
 * 
 * Return value: returns index of the file found, or false if file was not found
 * 
 * 
 * GenerateSongData: Parses song data from a directory
 * 
 * GenerateSongData parameters:
 * directoryStart: index of the first file in the directory
 * directoryEnd: index of the first file in the next directory (a.k.a. last file of directory + 1)
 * 
 * Return value: a Song object if successful, false if unsuccessful
 * 
 * 
 * FetchMetadataStringFromOsuFile: Returns the metadata section of a .osu file as string
 * 
 * FetchMetadataStringFromOsuFile parameters:
 * fileIndex: Index of the file in the directorySelector.files list
 * 
 * Return value: String which contains the entire Metadata section, or false if not found
 * 
 * 
 * FindFileInFileList: Finds specified file in the directorySelector.files array
 * 
 * FindFileInFileList parameters:
 * file: name of the file as string
 * startIndex: lower bound of the range of the search (inclusive)
 * endIndex: higher bound of the range of the search (exclusive)
 * 
 * Return value: number of the index the file was found, or false if file was not found
 * 
 * 
 * TrimPathString: Trims the filename at the end of a relative path string to get relative directory path
 *
 * TrimPathString parameters:
 * relativePath: Relative path string which needs trimming
 *
 * Return value: Relative path to the directory of the file
 * 
 * 
 * TrimLeadingSpaces: Trims leading spaces from any string
 * 
 * TrimLeadingSpaces parameters:
 * string: string that needs trimming
 * 
 * Return value: string without leading spaces
 * 
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
	}

	get aspectRatio() {
		return this.context.canvas.width / this.context.canvas.height;
	}

	get inverseAspectRatio() {
		return this.context.canvas.height / this.context.canvas.width;
	}

	async GenerateSongList(clearList = true) {
		if (clearList) {
			this.songList = [];
		}

		let currentDirectory = null;
		let directoryStartIndex = null;

		for (let i = 0; i < this.directorySelector.files.length; i++) {
			//Check if we're not in the same directory, if true process the folder
			if (currentDirectory != this.TrimPathString(this.directorySelector.files[i].webkitRelativePath)) {
				//Wait until song data has been generated
				let result = await this.GenerateSongData(directoryStartIndex, i);

				//If song data was generated successfully, push it to the songList
				if (result !== false) {
					this.songList.push(result);
				}

				//Update index and path
				directoryStartIndex = i;
				currentDirectory = this.TrimPathString(this.directorySelector.files[i].webkitRelativePath);
			}

			console.log(i + " files out of " + this.directorySelector.files.length + " processed");
		}
		console.log("List generation done!");
		return;
	}

	FindOsuFile(directoryStart, directoryEnd) {
		for (let i = directoryStart; i < directoryEnd; i++) {
			if (this.directorySelector.files[i].webkitRelativePath.endsWith(".osu")) {
				return i;
			}
		}

		return false;
	}

	async GenerateSongData(directoryStart, directoryEnd) {
		//Find any .osu file in the directory
		let osuFileIndex = this.FindOsuFile(directoryStart, directoryEnd);

		//Check if .osu file was found
		if (osuFileIndex !== false) {
			let currentSong = new Song();

			//Get metadata string from the .osu file
			let rawMetadataString = await this.FetchMetadataStringFromOsuFile(osuFileIndex);

			if (rawMetadataString !== false) {
				//Get metadata and add to the song object
				currentSong.title = rawMetadataString.match(/(?<=Title:).*/)[0];
				currentSong.artist = rawMetadataString.match(/(?<=Artist:).*/)[0];
				currentSong.author = rawMetadataString.match(/(?<=Creator:).*/)[0];

				//Check validity of the .osu files in the directory
				for (let i = directoryStart; i < directoryEnd; i++) {
					if (this.directorySelector.files[i].webkitRelativePath.endsWith(".osu")) {
						let reader = new FileReader();
						let directorySelector = this.directorySelector;


						//Get file contents
						let promise = new Promise(function (resolve, reject) {
							reader.onload = function () { resolve() };
							reader.onerror = function () { reject() };

							reader.readAsText(directorySelector.files[i]);
						});

						//Wait for file reader
						await promise;

						let rawOsuString = reader.result;

						let modeMatch = rawOsuString.match(/(?<=Mode:).*/);

						//Make sure match was found
						if (modeMatch !== null) {
							//Check if correct game mode
							if (this.TrimLeadingSpaces(modeMatch[0]) == 3) {
								//Store possible matches
								let audioFile = rawOsuString.match(/(?<=AudioFilename:).*/);
								let bgImageFile = rawOsuString.match(/(?<=0,0,").*(?=",0,0)/);

								//Check if match exists and find file index if true, assign to null if false
								if (audioFile !== null) {
									//Get index of the audio file
									audioFile = this.FindFileInFilelist(this.TrimLeadingSpaces(audioFile[0]), directoryStart, directoryEnd);

									//Check if filename was found and set it to null if not
									if (audioFile === false) {
										audioFile = null;
									}
								}
								else {
									audioFile = null;
								}

								//Check if match exists and find file index if true, assign to null if false
								if (bgImageFile !== null) {
									//Get index of the background image file
									bgImageFile = this.FindFileInFilelist(this.TrimLeadingSpaces(bgImageFile[0]), directoryStart, directoryEnd);

									//Check if filename was found and set it to null if not
									if (bgImageFile === false) {
										bgImageFile = null;
									}
								}
								else {
									bgImageFile = null;
								}

								//Push to chartList
								currentSong.chartList.push(new ChartFiles(i, audioFile, bgImageFile));
							}
						}
					}
				}
			}

			//Make sure valid charts were found
			if (currentSong.chartList.length > 0) {
				return currentSong;
			}
			else {
				return false;
			}
		}
		else {
			//Return false if no .osu files were in the directory
			return false;
		}
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

		//Returns the entire [Metadata] section as string from start to end
		//What kind of language regular expressions even are? Elvish?
		var result = reader.result.match(/\[Metadata\][\s\S]*?(?=[\r\n]\[)/);

		if (result !== null) {
			return result[0];
		}
		else {
			return false;
		}
	}

	FindFileInFilelist(file, startIndex, endIndex) {
		for (let i = startIndex; i < endIndex; i++) {
			if (this.directorySelector.files[i].webkitRelativePath.endsWith(file)) {
				return i;
			}
		}

		return false;
	}

	TrimPathString(relativePath) {
		return relativePath.substr(0, relativePath.lastIndexOf("/") + 1);
	}

	TrimLeadingSpaces(string) {
		while (true) {
			if (string.charCodeAt(0) == 32) {
				string = string.substr(1);
			}
			else {
				return string;
			}
		}
	}
}