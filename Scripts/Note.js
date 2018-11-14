/*
 * Class containing data for single note
 * 
 * Properties:
 * time: Time point in milliseconds from start of chart which marks the point of the note
 * type: Type of the note as string. 
 * 
 * Type table:
 * normal: 0
 * long note start: 1
 * longNoteEnd: 2
*/
class Note {
	constructor(time, type = 0) {
		this.time = time;
		this.type = type;
	}
}