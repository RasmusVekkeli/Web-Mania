/*
 * Class containing info of a single chart
 * 
 * Properties:
 * previewTime: Time point in milliseconds from start of chart which marks the point where the chart preview should start
 * nPlus1: Boolean which determines if chart should be treated as N + 1 Key chart, unused
 * keyCount: Number of keys chart uses
 * timingPoints: Array of TimingPoint objects
 * originalTimingPoints: Array of original (not mutaded by rates) timing objects
 * scrollSpeedPoints: Array of ScrollSpeedPoint objects
 * originalScrollSpeedPoints: Array of original (not mutated by rates) ScrollSpeedPoint objects
 * noteList: 2 dimensional array where first dimension determines lane and second one is array of Note objects. For example this.noteList[3][1] accesses second note of fourth lane.
 * originalNoteList: Same as noteList except contains original (not mutated by rates) notes.
 * 
 * Constructor parameters: none
 * 
 * 
 * Functions:
 * ParseOsuFile: Parses given .osu file into chart object
 * Parameters:
 * fileIndex: The index of the file in game.directorySelector.files array
 * 
 * 
 * ColumnFromValue: Returns a column value using an X-coordinate value and key count from .osu file
 * Parameters:
 * value: X-coordinate of a note.
 * keyCount: Key count of chart the note is in
 * 
 * 
 * NoteTypeFromValue: Returns a note type from value from .osu file
 * Parameters:
 * value: Note type value
 * 
 * 
 * get firstNote: Returns first note of the Chart object
 * 
 * 
 * get lastNote: Returns last note of the Chart object
*/
class Chart {
	constructor() {
		this.previewTime = 0;
		this.nPlus1 = false;
		this.keyCount;

		this.timingPoints = [];
		this.originalTimingPoints = [];
		this.scrollSpeedPoints = [];
		this.originalScrollSpeedPoints = [];

		this.noteList = [[]];
		this.originalNoteList = [[]];
	}

	static async ParseOsuFile(fileIndex) {
		//Check correct file type
		if (game.directorySelector.files[fileIndex].webkitRelativePath.endsWith(".osu")) {
			//Read file and wait for results
			var reader = new FileReader();

			var promise = new Promise(function (resolve, reject) {
				reader.onload = function () { resolve() };
				reader.onerror = function () { reject() };

				reader.readAsText(game.directorySelector.files[fileIndex]);
			});

			await promise;

			var rawChartString = reader.result;

			var returnChart = new Chart();

			//Store possible matches of needed values
			let previewMatch = rawChartString.match(/(?<=PreviewTime:).*/);
			let nPlus1Match = rawChartString.match(/(?<=SpecialStyle:).*/);
			let keyCountMatch = rawChartString.match(/(?<=CircleSize:).*/); //Yes, it's circle size for some reason

			//Assign values if matched
			if (previewMatch !== null) {
				returnChart.previewTime = Number(TrimLeadingSpaces(previewMatch[0]));
			}

			if (nPlus1Match !== null) {
				returnChart.specialMatch = Boolean(TrimLeadingSpaces(nPlus1Match[0]));
			}

			if (keyCountMatch !== null) {
				returnChart.keyCount = Number(TrimLeadingSpaces(keyCountMatch[0]));

				returnChart.noteList = [];

				for (let i = 0; i < returnChart.keyCount; i++) {
					returnChart.noteList.push([]);
				}
			}
			else {
				//If we can't find key count we can't really play the chart so the parsing fails
				return false;
			}

			//Another one of these regexes
			let rawTimingPointsString = rawChartString.match(/(?<=\[TimingPoints\])[\s\S]*?(?=[\r\n]\[)/)[0];

			//Parse each line of the above match
			for (let i = 0; rawTimingPointsString.indexOf("\n", i) != -1;) {
				//Get next line
				let line = rawTimingPointsString.substr(i, rawTimingPointsString.indexOf("\n", i) - i);

				//Check if seems to have correct formatting
				if ((line.match(/,/g) || []).length == 7) {
					//Get positions of needed commas for later
					let commaPositions = [];
					commaPositions[0] = line.indexOf(",");
					commaPositions[1] = line.indexOf(",", commaPositions[0] + 1);
					commaPositions[2] = line.indexOf(",", commaPositions[1] + 1);

					//Extract data
					let time = Number(line.substr(0, commaPositions[0]));
					let bpm = Number(line.substr(commaPositions[0] + 1, commaPositions[1] - commaPositions[0] - 1));
					let meter = line.substr(commaPositions[1] + 1, commaPositions[2] - commaPositions[1] - 1);

					//Make sure data was found
					if (time !== undefined && bpm && meter) {
						if (bpm > 0) {
							returnChart.timingPoints.push(new TimingPoint(time, TimingPoint.msPerBeatToBPM(bpm), meter + "/4"));
						}
						else {
							returnChart.scrollSpeedPoints.push(new ScrollSpeedPoint(time, ScrollSpeedPoint.NegativeValueToSpeedMult(bpm)));
						}
					}
				}

				//Advance iterator to start of next line
				i = rawTimingPointsString.indexOf("\n", i) + 1;
			}

			let rawHitObjectsString = rawChartString.match(/(?<=\[HitObjects\])[\s\S]*/)[0];

			for (let i = 0; rawHitObjectsString.indexOf("\n", i) != -1;) {
				let line = rawHitObjectsString.substr(i, rawHitObjectsString.indexOf("\n", i) - i);

				if ((line.match(/,/g) || []).length == 5) {
					let commaPositions = [];
					commaPositions[0] = line.indexOf(",");
					commaPositions[1] = line.indexOf(",", commaPositions[0] + 1);
					commaPositions[2] = line.indexOf(",", commaPositions[1] + 1);
					commaPositions[3] = line.indexOf(",", commaPositions[2] + 1);
					commaPositions[4] = line.indexOf(",", commaPositions[3] + 1);

					let column = Chart.ColumnFromValue(Number(line.substr(0, commaPositions[0])), returnChart.keyCount);
					let time = Number(line.substr(commaPositions[1] + 1, commaPositions[2] - commaPositions[1] - 1));
					let type = Chart.NoteTypeFromValue(Number(line.substr(commaPositions[2] + 1, commaPositions[3] - commaPositions[2] - 1)));

					if (TypeOf(column) == "number" && TypeOf(time) == "number" && TypeOf(type) == "number") {
						if (type === 1) {
							let endTime = Number(line.substr(commaPositions[4] + 1, line.indexOf(":") - commaPositions[4] - 1));

							if (TypeOf(endTime) == "number") {
								returnChart.noteList[column].push(new Note(time, type));
								returnChart.noteList[column].push(new Note(endTime, 2));
							}
						}
						else {
							returnChart.noteList[column].push(new Note(time, type));
						}
					}
				}

				//Advance iterator to start of next line
				i = rawHitObjectsString.indexOf("\n", i) + 1;
			}
		}
		else {
			return false;
		}

		for (let i = 0; i < returnChart.noteList.length; i++) {
			returnChart.noteList[i].sort(function (a, b) { return a.time - b.time });
		}

		returnChart.originalNoteList = JSON.parse(JSON.stringify(returnChart.noteList));

		returnChart.scrollSpeedPoints.sort(function (a, b) { return a.time - b.time });
		returnChart.originalScrollSpeedPoints = JSON.parse(JSON.stringify(returnChart.scrollSpeedPoints));

		returnChart.timingPoints.sort(function (a, b) { return a.time - b.time });
		returnChart.originalTimingPoints = JSON.parse(JSON.stringify(returnChart.timingPoints));

		return returnChart;
	}

	static ColumnFromValue(value, keyCount) {
		return Math.floor(value / (512 / keyCount));
	}

	static NoteTypeFromValue(value) {
		var first = (value & 1) == 1;
		var seventh = (value & 128) == 128;

		if (first && seventh) {
			return false;
		}

		if (first) {
			return 0;
		}

		if (seventh) {
			return 1;
		}

		return false;
	}

	get firstNote() {
		let earliestNote = new Note(Infinity, 0);

		for (let i = 0; i < this.noteList.length; i++) {
			if (this.noteList[i][0].time < earliestNote) {
				earliestNote = this.noteList[i][0];
			}
		}

		return earliestNote;
	}

	get lastNote() {
		let latestNote = new Note(0, 0);

		for (let i = 0; i < this.noteList.length; i++) {
			if (this.noteList[i][this.noteList[i].length - 1].time > latestNote.time) {
				latestNote = this.noteList[i][this.noteList[i].length - 1];
			}
		}

		return latestNote
	}
}