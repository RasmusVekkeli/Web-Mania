class Playfield extends GameObject {
	constructor() {
		super(false, false, true);

		//Most of these should be rewritten to get the values from some config class
		this.keyCount = 4;
		this.laneWidth = 128;
		this.hitPosition = 200;
		this.type;
		this.snapColor;
		this.centered;
		this.pos = new Rect(this.centeredPosition, 0, this.laneWidth * this.keyCount, game.context.canvas.height);
		this.downScroll = true;
		this.scrollSpeedMult = 1;
	}

	Update() {

	}

	Draw() {
		if (!this.skipDraw) {
			//Draw playfield bg
			game.context.fillStyle = "rgba(0, 0, 0, 0.7)";
			game.context.fillRect(this.pos.x, this.pos.y, this.width, this.pos.h);

			//Draw playfield judgement line
			game.context.fillStyle = "#FFFFFF";

			if (this.downScroll) {
				game.context.fillRect(this.pos.x, game.context.canvas.height - this.hitPosition, this.width, 10);
			}
			else {
				game.context.fillRect(this.pos.x, this.hitPosition, this.width, -10);
			}
			
			//Draw playfield notes
			if (game.state === 4) {
				for (let i = 0; i < game.currentChart.noteList.length; i++) {
					for (let j = game.currentChart.noteList[i].length - 1; j >= 0; j--) {
						let y;

						//Check if long note head was hit, but not released. Draw on hitposition if true
						if (game.currentChart.noteList[i][j].type == 1) {
							if ((game.currentScore[i][j] != game.hitWindows.miss.accValue && game.currentScore[i][j] !== undefined) && game.currentScore[i][j + 1] === undefined) {
								y = this.downScroll ? game.context.canvas.height - this.hitPosition : this.hitPosition;
							}
							else {
								y = this.CalculateY(game.currentChart.noteList[i][j]);
							}

							if (game.currentScore[i][j] === undefined) {
								//Draw long note bodies
								game.context.fillStyle = "#FFFFFF";
								game.context.fillRect(this.pos.x + this.laneWidth * i, y, this.laneWidth, this.CalculateY(game.currentChart.noteList[i][j + 1]) - y);
							}
						}
						else {
							y = this.CalculateY(game.currentChart.noteList[i][j]);
						} 

						//Draw other notes
						if (game.currentChart.noteList[i][j].type != 2) {
							if (game.currentScore[i][j] === undefined || game.currentScore[i][j] === game.hitWindows.miss.accValue) {
								game.context.fillStyle = "#FF0000";
								game.context.fillRect(this.pos.x + this.laneWidth * i, y, this.laneWidth, this.downScroll ? -30 : 30);
							}
						}
					}
				}
			}

			game.context.fillStyle = "#FFFFFF";
			game.context.font = "80px Arial";
			//Judgement
			game.context.fillText(game.lastJudgement.judgeText, this.centeredPosition + (this.width - game.context.measureText(game.lastJudgement.judgeText).width) / 2, 500);
			//Combo
			game.context.fillText(game.currentCombo.toString(), this.centeredPosition + (this.width - game.context.measureText(game.currentCombo.toString()).width) / 2, 300);
		}
	}

	get centeredPosition() {
		return (game.context.canvas.width - this.width) / 2;
	}

	get width() {
		return this.keyCount * this.laneWidth;
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