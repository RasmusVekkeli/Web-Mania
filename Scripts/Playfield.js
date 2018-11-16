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
			game.context.fillStyle = "rgba(0, 0, 0, 0.7)";
			game.context.fillRect(this.pos.x, this.pos.y, this.pos.w, this.pos.h);

			if (game.currentChart !== null) {
				for (let i = 0; i < game.currentChart.noteList.length; i++) {
					for (let j = game.currentChart.noteList[i].length - 1; j > 0; j--) {
						game.context.fillStyle = "#FF0000";
						game.context.fillRect(this.pos.x + this.laneWidth * i, 1080 - this.hitPosition + (game.currentPlayTime - game.currentChart.noteList[i][j].time) * this.scrollSpeedMult, this.laneWidth, 30);
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
}