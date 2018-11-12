/*
 * Class containing data for single note
 * 
 * Properties:
 * time: Time point in milliseconds from start of chart which marks the point of the note
 * type: Type of the note as string. Can be "normal", "longNoteStart" or "longNoteEnd"
*/
class Note {
	constructor(time, type = "normal") {
		this.time = time;
		this.type = type;
	}
}