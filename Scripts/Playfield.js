class Playfield extends GameObject {
	constructor() {
		super(false, false, true);

		//Most of these should be rewritten to get the values from some config class
		this.keyCount = 4;
		this.laneWidth = 128;
		this.hitPosition = 160;
		this.barnoteHeight = 30;
		this.type;
		this.snapColor;
		this.centered;
		this.pos = new Rect(this.centeredPosition, 0, this.laneWidth * this.keyCount, game.context.canvas.height);
		this.downScroll = true;
		this.scrollSpeedMult = 2.3;

		this.beatLineHeight = 30;
		this.beatLineColor = "#FFFFFF";
	}

	Update() {
		if (game.state === 4) {
			let adjustedT = game.beatT * 2;

			if (adjustedT > 1) {
				adjustedT = 0.9999; //Because if both gradient stops are 0 it turns into solid color of white instead of transparent (in my case) for some reason. Blame the web API guys, not me.
			}

			this.beatLineGradient = game.context.createLinearGradient(0, this.hitPositionY, 0, this.hitPositionY + (this.downScroll ? -this.beatLineHeight : this.beatLineHeight));

			this.beatLineGradient.addColorStop(1 - adjustedT, "rgba(0, 0, 0, 0)");
			this.beatLineGradient.addColorStop(0, this.beatLineColor);
		}
	}

	Draw() {
		if (!this.skipDraw) {
			//Draw playfield bg
			game.context.fillStyle = "rgba(0, 0, 0, 0.7)";
			game.context.fillRect(this.pos.x, this.pos.y, this.width, this.pos.h);

			//Draw playfield judgement line
			game.context.fillStyle = "#FFFFFF";
			game.context.fillRect(this.pos.x, this.hitPositionY, this.width, this.downScroll ? 2 : -2);

			//Draw beatline
			game.context.fillStyle = this.beatLineGradient;
			game.context.fillRect(this.pos.x, this.hitPositionY, this.width, this.downScroll ? -this.beatLineHeight : this.beatLineHeight);
			
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
									game.context.fillRect(this.pos.x + this.laneWidth * i, y, this.laneWidth, this.downScroll ? -this.barnoteHeight : this.barnoteHeight);
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
									game.context.fillRect(this.pos.x + this.laneWidth * i, y, this.laneWidth, endY - y);

									//Long note head
									game.context.fillStyle = "#FF0000";
									game.context.fillRect(this.pos.x + this.laneWidth * i, y, this.laneWidth, this.downScroll ? -this.barnoteHeight : this.barnoteHeight);
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
		return this.keyCount * this.laneWidth;
	}

	get hitPositionY() {
		return this.downScroll ? game.context.canvas.height - this.hitPosition : this.hitPosition;
	}

	CalculateY(note) {
		if (this.downScroll) {
			return game.context.canvas.height - this.hitPosition + (game.currentPlayTime - note.time) * this.scrollSpeedMult;
		}
		else {
			return this.hitPosition - (game.currentPlayTime - note.time) * this.scrollSpeedMult;
		}
	}

	ReloadPlayfieldParameters() {
		if (game.currentChart !== null) {
			this.keyCount = game.currentChart.keyCount;
		}
		
		this.laneWidth = game.config.laneWidth;
		this.hitPosition = game.config.hitPosition;
		this.type = 0;
		this.snapColor = false;
		this.centered = true;
		this.pos = new Rect(this.centeredPosition, 0, this.laneWidth * this.keyCount, game.context.canvas.height);
		this.downScroll = game.config.downScroll;
		this.scrollSpeedMult = game.config.scrollSpeedMult;
	}
}