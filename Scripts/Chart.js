/*
 * Class containing info of a single chart
 * 
 * Properties:
 * previewTime: Time point in milliseconds from start of chart which marks the point where the chart preview should start
 * nPlus1: Boolean which determines if chart should be treated as N + 1 Key chart
 * keyCount: Number of keys chart uses
 * timingPoints: Array of TimingPoint objects
 * scrollSpeedPoints: Array of ScrollSpeedPoint objects
 * noteList: 2 dimensional array where first dimension determines lane and second one is array of Note objects. For example this.noteList[3][1] accesses second note of fourth lane.
*/
class Chart {
	constructor() {
		this.previewTime = 0;
		this.nPlus1 = false;
		this.keyCount;

		this.timingPoints = [];
		this.scrollSpeedPoints = [];

		this.noteList = [[]];

		this.majorBPM;
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
			returnChart.noteList[i].sort(function (a, b) { a.time - b.time });
		}

		returnChart.scrollSpeedPoints.sort(function (a, b) { a.time - b.time });
		returnChart.timingPoints.sort(function (a, b) { a.time - b.time });

		//returnChart.majorBPM = Chart.CalculateMajorBPM(returnChart.timingPoints, returnChart.firstNote, returnChart.lastNote);

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

	static CalculateMajorBPM(timingPoints, firstNote, lastNote) {
		if (timingPoints.length == 1) {
			return timingPoints[0].bpm;
		}

		var bpmLengths = [];

		var firstPoint;
		var lastPoint;

		if (firstNote.time < timingPoints[0].time) {
			firstPoint = 0;
		}
		else {
			//Get first point
			for (let i = 0; i < timingPoints.length; i++) {
				if (timingPoints[i].time <= firstNote.time && timingPoints[i + 1] > firstNote.time) {
					firstPoint = i;
					break;
				}
			}
		}

		//Get last point
		for (let i = timingPoints.length - 1; i > 0; i--) {
			if (timingPoints[i].time < lastNote.time) {
				lastPoint = i;
				break;
			}
		}

		bpmLengths.push({ bpm: timingPoints[firstPoint].bpm, length: firstNote.time - timingPoints[firstPoint + 1] });

		if (bpmLengths[0].bpm == timingPoints[lastPoint].bpm) {
			bpmLengths[0].length += lastNote.time - timingPoints[lastPoint].time;
		}
		else {
			bpmLengths.push({ bpm: timingPoints[lastPoint].bpm, length: lastNote.time - timingPoints[lastPoint].time });
		}

		for (let i = firstPoint + 1; i < lastPoint; i++) {
			let found = false;

			for (let j = 0; j < bpmLengths.length; j++) {
				if (bpmLengths[j].bpm == timingPoints[i].bpm) {
					bpmLengths[j].length += timingPoints[i + 1].time - timingPoints[i].time;
					found = true;
				}
			}

			if (!found) {
				bpmLengths.push({ bpm: timingPoints[i].bpm, length: timingPoints[i + 1].time - timingPoints[i].time });
			}
		}

		let longestBPM;
		let longestValue = 0;

		for (let i = 0; i < bpmLengths.length; i++) {
			if (bpmLengths[i].length > longestValue) {
				longestValue = bpmLengths[i].length;
				longestBPM = bpmLengths[i].bpm;
			}
		}

		return longestBPM;
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
			if (this.noteList[i][this.noteList.length - 1].time > latestNote.time) {
				latestNote = this.noteList[i][this.noteList.length - 1];
			}
		}

		return latestNote
	}
}