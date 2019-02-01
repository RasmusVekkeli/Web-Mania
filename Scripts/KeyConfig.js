/*
 * Class which stores all individual settings for a single key mode (Eg. 4 key mode has it's own object of this class, 7 key its own etc...)
 * The properties can be undefined, since undefined values (except keys) are automatically overwritten with global values.
 * 
 * Properties:
 * laneWidth: Width in pixels of each lane. All lanes have the same width.
 * hitPosition: Position from the edge of screen in pixels where the notes should be when it time to hit. (Bottom of the screen for downscroll, top of the screen for upscroll)
 * scrollSpeedMult: Multiplier of the "physical" speed the notes move on screen. Notes move 1000 pixels per second by default and the screen is always 1080 pixels tall.
 * specialLane: Boolean which determines if a special lane should be used for the key mod. Unimplemented
 * specialLaneLeft: Boolean which determines if the special lane should be on the left side. False for right side. Has no effect if specialLane is set to false.
 * barNoteHeight: Height in pixels of the bar notes.
 * noteSkin: A reference to a noteskin object. No such class exists however so this is unimplemented.
 * snapColours: An array of HTML colours (rgb, rgba, hex) which determines the colours of the notes for each snap. Unimplemented.
 * beatLineHeight: Determines the height of the gradient which pulses to the beat. Set to 0 to effectively disable.
 * beatLineColour: Colour of the gradient.
*/
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