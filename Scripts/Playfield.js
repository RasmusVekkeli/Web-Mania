class Playfield extends GameObject {
	constructor() {
		super(false, false, true);

		this.keyConfig = game.currentKeyConfig;

		//Most of these should be rewritten to get the values from some config class
		this.pos = new Rect(this.centeredPosition, 0, this.keyConfig.laneWidth * (game.currentChart === null ? 0 : game.currentChart.keyCount), game.context.canvas.height);
	}

	Update() {
		if (game.state === 4) {
			let adjustedT = game.beatT * 2;

			if (adjustedT > 1) {
				adjustedT = 0.9999; //Because if both gradient stops are 0 it turns into solid color of white instead of transparent (in my case) for some reason. Blame the web API guys, not me.
			}

			this.beatLineGradient = game.context.createLinearGradient(0, this.hitPositionY, 0, this.hitPositionY + (this.keyConfig.downScroll ? -this.keyConfig.beatLineHeight : this.keyConfig.beatLineHeight));

			this.beatLineGradient.addColorStop(1 - adjustedT, "rgba(0, 0, 0, 0)");
			this.beatLineGradient.addColorStop(0, this.keyConfig.beatLineColour);
		}
	}

	Draw() {
		if (!this.skipDraw) {
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
					for (let j = game.currentChart.noteList[i].length - 1; j >= 0; j--) {
						let y;

						switch (game.currentChart.noteList[i][j].type) {
							case 0: //Normal note
								if (game.currentScore[i][j] === undefined || game.currentScore[i][j] === game.hitWindows.miss.accValue) {
									y = this.CalculateY(game.currentChart.noteList[i][j]);

									game.context.fillStyle = "#FF0000";
									game.context.fillRect(this.pos.x + this.keyConfig.laneWidth * i, y, this.keyConfig.laneWidth, this.keyConfig.downScroll ? -this.keyConfig.barNoteHeight : this.keyConfig.barNoteHeight);
								}

								break;

							case 1: //Long note
								if (game.currentScore[i][j] !== game.hitWindows.miss.accValue && game.currentScore[i][j + 1] === undefined) {
									y = game.currentScore[i][j] === undefined ? this.CalculateY(game.currentChart.noteList[i][j]) : this.hitPositionY;
									let endY;

									if (game.currentChart.noteList[i][j + 1].time < game.currentPlayTime) {
										endY = y;
									}
									else {
										endY = this.CalculateY(game.currentChart.noteList[i][j + 1]);
									}

									//Long note body
									game.context.fillStyle = "#FFFFFF";
									game.context.fillRect(this.pos.x + this.keyConfig.laneWidth * i, y, this.keyConfig.laneWidth, endY - y);

									//Long note head
									game.context.fillStyle = "#FF0000";
									game.context.fillRect(this.pos.x + this.keyConfig.laneWidth * i, y, this.keyConfig.laneWidth, this.keyConfig.downScroll ? -this.keyConfig.barNoteHeight : this.keyConfig.barNoteHeight);
								}

								break;
						}
					}
				}
			}
		}
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
}