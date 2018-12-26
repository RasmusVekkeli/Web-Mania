class KeyConfig {
	constructor(keys, laneWidth, hitPosition, downScroll, scrollSpeedMult, specialLane, specialLaneLeft, barNoteHeight, noteSkin, snapColours, beatLineHeight, beatLineColour) {
		//Uhh, I wonder if I shouldn't have made this constructor this convoluted
		this.laneWidth = laneWidth;
		this.hitPosition = hitPosition;
		this.downScroll = downScroll;
		this.scrollSpeedMult = scrollSpeedMult;
		this.specialLane = specialLane;
		this.specialLaneLeft = specialLaneLeft;
		this.barNoteHeight = barNoteHeight;
		this.noteSkin = noteSkin;
		this.snapColours = snapColours;
		this.beatLineHeight = beatLineHeight;
		this.beatLineColour = beatLineColour;

		this.keys = keys;
	}


}