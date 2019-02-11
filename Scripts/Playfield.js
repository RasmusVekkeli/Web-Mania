/*
 * Class for managing and rendering the playfield
 * 
 * Inherits from GameObject class.
 * 
 * Properties: 
 * keyConfig: A constructed KeyConfig object (see Game class's get currentKeyConfig getter) which stores settings for the current keymode.
 * pos: A Rect object which stores the dimensions of the playfield. Note: some values (such as width of the playfield) are calculated separately from this object.
 * nextNoteIndex: An array which stores the indexes of the next note which has not already left the screen. Used for determining the first note to be checked for position (see Draw function).
 * noteYsToRender: An array of Y coordinate values of the notes to be rendered on screen. 
 * longNoteYsToRender: An array of renderLNYs objects (see Draw function) which determines the long note Y coordinates (head and tail of the long note) to use for rendering
 * beatLineGradient: A linear gradient color object. Used to render the beatline. Has to be recreated each frame with new values since it can't be directly modified outside of the constructor for some reason.
 * 
 * Constructor parameters:
 * none
 * 
 * Functions:
 * Update: Recreates the beatLineGradient
 * Parameters: none
 * 
 * Draw: Draws the playfield and notes on screen. Only notes that are on screen are drawn. Each note is checked if it's on screen. Checks start at the index stored in nextNoteIndex array where index value in position 0 is left most lane.
 * Parameters: none
 * 
 * CalculateY: Returns the Y coordinate of a given note object. The function returns automatically downscroll and upscroll values depending if keyConfig.downScroll value is true or not.
 * Parameters: A note object whose Y coordinate needs calculating.
 * Return value: A number of the Y screen coordinate of the note given.
 * 
 * ReloadPlayfieldParameters: Recontructs the keyConfig object and recalculates the playfield position (pos object).
 * Parameters: none
 * 
 * get centeredPosition: Returns an X coordinate where the playfield has to be drawn at for it to be centered horizontally.
 * 
 * get width: Returns the width in pixels of the current playfield.
 * 
 * get hitPositionY: Returns the Y coordinate of the hitposition with automatically calculated downscroll or upscroll value (see CalculateY function).
*/
class Playfield extends GameObject {
	constructor() {
		super(false, false, true);

		this.keyConfig = game.currentKeyConfig;

		this.pos = new Rect(this.centeredPosition, 0, this.keyConfig.laneWidth * (game.currentChart === null ? 0 : game.currentChart.keyCount), game.context.canvas.height);

		this.nextNoteIndex = [];
		this.noteYsToRender = [];
		this.longNoteYsToRender = [];
	}

	Update() {
		if (game.state === 4) {
			//Beatline code
			let adjustedT = game.beatT * 2;

			if (adjustedT > 1) {
				adjustedT = 0.9999; //Because if both gradient stops are the same it turns into solid color of white instead of transparent (in my case) for some reason. Blame the web API guys, not me.
			}

			this.beatLineGradient = game.context.createLinearGradient(0, this.hitPositionY, 0, this.hitPositionY + (this.keyConfig.downScroll ? -this.keyConfig.beatLineHeight : this.keyConfig.beatLineHeight));

			this.beatLineGradient.addColorStop(1 - adjustedT, "rgba(0, 0, 0, 0)");
			this.beatLineGradient.addColorStop(0, this.keyConfig.beatLineColour);
		}
	}

	Draw() {
		if (!this.skipDraw && game.state == 4) {
			//Draw playfield bg
			game.context.fillStyle = "rgba(0, 0, 0, 0.7)";
			game.context.fillRect(this.pos.x, this.pos.y, this.width, this.pos.h);

			//Draw playfield judgement line
			game.context.fillStyle = "#FFFFFF";
			game.context.fillRect(this.pos.x, this.hitPositionY, this.width, this.keyConfig.downScroll ? 2 : -2);

			//Draw beatline
			game.context.fillStyle = this.beatLineGradient;
			game.context.fillRect(this.pos.x, this.hitPositionY, this.width, this.keyConfig.downScroll ? -this.keyConfig.beatLineHeight : this.keyConfig.beatLineHeight);
			
			//Draw playfield notes
			if (game.state === 4) {
				for (let i = 0; i < game.currentChart.noteList.length; i++) {
                    noteFor:
					//Calculate Y-values
					for (let j = this.nextNoteIndex[i]; j < game.currentChart.noteList[i].length; j++) {
						//A constructor for object which stores long note Y coordinates, only used inside Draw function
						function renderLNYs (y, endY) {
							this.y = y;
							this.endY = endY;
						}

						let yValue;

						switch (game.currentChart.noteList[i][j].type) {
							case 0:
								//Calculate note's Y coordinate
								yValue = this.CalculateY(game.currentChart.noteList[i][j]);

								//Check if note has not yet entered on screen
								if (this.keyConfig.downScroll ? (yValue < 0) : (yValue > game.context.canvas.height)) {
                                    break noteFor;
								}
								//Check if note has already left the screen
								else if (this.keyConfig.downScroll ? (yValue - this.keyConfig.barNoteHeight > game.context.canvas.height) : (yValue + this.keyConfig.barNoteHeight < 0)) {
									this.nextNoteIndex[i]++;
								}
								//Note is on screen if we reached here, push its Y coordinate to render list
								else {
									if (game.currentScore[i][j] === undefined || game.currentScore[i][j] === game.hitWindows.miss.accValue) {
										this.noteYsToRender.push(yValue);
									}
								}

								break;

							case 1:
								//Calculate note's Y coordinate
								yValue = this.CalculateY(game.currentChart.noteList[i][j]);
								let endYValue = this.CalculateY(game.currentChart.noteList[i][j + 1]);

								//If the long note's head has been hit (or missed), but it's tail hasn't, make sure the head's Y coordinate is at hitposition
								if (game.currentScore[i][j] !== game.hitWindows.miss.accValue && game.currentScore[i][j + 1] === undefined) {
									if (game.currentScore[i][j] !== undefined) {
										yValue = this.hitPositionY;
									}
								}
								else {
									break;
								}

								//Make sure long notes won't render "in reverse" if long note head has been held too long
								if (game.currentChart.noteList[i][j + 1].time < game.currentPlayTime) {
									endYValue = yValue;
								}

								//Check if long note head has not yet entered on screen
								if (this.keyConfig.downScroll ? (yValue < 0) : (yValue > game.context.canvas.height)) {
									break noteFor;
								}
								//Check if long note tail has already left the screen
								else if (this.keyConfig.downScroll ? (endYValue > game.context.canvas.height) : (endYValue < 0)) {
									this.nextNoteIndex[i]++;
								}
								//The entire long note is on screen if we reached here, push it's head's Y coordinate to render note list and tail's Y coordinates to render long note list 
								else {
									this.noteYsToRender.push(yValue);
									this.longNoteYsToRender.push(new renderLNYs(yValue, endYValue));
								}

								break;

							case 2:
								break;
						}
					}

					//Render long notes
					while (this.longNoteYsToRender.length > 0) {
						let longNoteYs = this.longNoteYsToRender.pop();

						game.context.fillStyle = "rgba(255, 255, 255, 0.4)";
						game.context.fillRect(this.pos.x + this.keyConfig.laneWidth * i, longNoteYs.y, this.keyConfig.laneWidth, longNoteYs.endY - longNoteYs.y);
					}

					//Render notes
					while (this.noteYsToRender.length > 0) {
						game.context.fillStyle = "#FF0000";
						game.context.fillRect(this.pos.x + this.keyConfig.laneWidth * i, this.noteYsToRender.pop(), this.keyConfig.laneWidth, this.keyConfig.downScroll ? -this.keyConfig.barNoteHeight : this.keyConfig.barNoteHeight);
					}
				}
			}
		}
	}

	CalculateY(note) {
		if (this.keyConfig.downScroll) {
			return game.context.canvas.height - this.keyConfig.hitPosition + (game.currentPlayTime - note.time) * this.keyConfig.scrollSpeedMult;
		}
		else {
			return this.keyConfig.hitPosition - (game.currentPlayTime - note.time) * this.keyConfig.scrollSpeedMult;
		}
	}

	ReloadPlayfieldParameters() {
		this.keyConfig = game.currentKeyConfig;

		this.pos = new Rect(this.centeredPosition, 0, this.keyConfig.laneWidth * (game.currentChart === null ? 0 : game.currentChart.keyCount), game.context.canvas.height);
	}

	get centeredPosition() {
		return (game.context.canvas.width - this.width) / 2;
	}

	get width() {
		return (game.currentChart === null ? 0 : game.currentChart.keyCount) * this.keyConfig.laneWidth;
	}

	get hitPositionY() {
		return this.keyConfig.downScroll ? game.context.canvas.height - this.keyConfig.hitPosition : this.keyConfig.hitPosition;
	}
}