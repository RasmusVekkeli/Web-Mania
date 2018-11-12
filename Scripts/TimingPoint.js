/*
 * Class containing timing information of a single section
 * 
 * Properties:
 * time: Time point in milliseconds from start of chart which marks start of timing section
 * bpm: Beats per minute number of the timing section
 * signature: Musical signature as string of the timing section
 * 
 * Functions:
 * msPerBeatToBPM: Returns bpm value from milliseconds per beat value
*/
class TimingPoint{
	constructor(time, bpm, signature = "4/4") {
		this.time = time;
		this.bpm = bpm;
		this.signature = signature;
	}

	static msPerBeatToBPM(msPerBeat) {
		return 60000 / msPerBeat;
	}
}