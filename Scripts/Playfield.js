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
			game.context.fillRect(this.pos.x, this.pos.y, this.width, this.pos.h);

			game.context.fillStyle = "#FFFFFF";
			game.context.fillRect(this.pos.x, 1080 - this.hitPosition, this.width, 10);

			if (game.currentChart !== null) {
				for (let i = 0; i < game.currentChart.noteList.length; i++) {
					for (let j = game.currentChart.noteList[i].length - 1; j > 0; j--) {
						let y = 1080 - this.hitPosition + (game.currentPlayTime - game.currentChart.noteList[i][j].time) * this.scrollSpeedMult;

						if (game.currentChart.noteList[i][j].type == 1) {
							game.context.fillStyle = "#FFFFFF";
							game.context.fillRect(this.pos.x + this.laneWidth * i, y, this.laneWidth, 1080 - this.hitPosition + (game.currentPlayTime - game.currentChart.noteList[i][j + 1].time) * this.scrollSpeedMult - y);
						}

						if (game.currentChart.noteList[i][j].type != 2) {
							game.context.fillStyle = "#FF0000";
							game.context.fillRect(this.pos.x + this.laneWidth * i, y, this.laneWidth, 30);
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
}