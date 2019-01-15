class SongWheel extends GameObject {
	constructor() {
		super(false, false, true);

		this.textPadding = 3;
		this.topIndex = 0;
		this.selectionIndex = 0;
		this.selectionPadding = 1;

		this.mainTextSize = 34;

		this.pos = new Rect(this.x, 0, this.width, game.context.canvas.height, true);
	}

	Update() {

	}

	Draw() {
		if (this.skipDraw || game.state !== 3) {
			return;
		}

		game.context.strokeStyle = "#FFFFFF";
		game.context.strokeRect(this.x, this.pos.y, this.width, this.pos.h);

		function getLoopingFromArray(array, index) {
			if (index < 0) {
				return array[array.length + index];
			}

			return array[index % array.length];
		}

		//Draw song panels
		let firstY = this.firstSongPanelY;

		game.context.textBaseline = "top";
		game.context.textAlign = "left";

		for (let i = 0; i < this.songPanelCount; i++) {
			if (i + this.topIndex == this.selectionIndex) {
				game.context.fillStyle = "rgba(255, 255, 255, 0.3)";
				game.context.fillRect(this.x, firstY + this.songPanelHeight * i, this.width, this.songPanelHeight);
			}

			//Panel border
			game.context.strokeStyle = "rgba(255, 255, 255, 1.0)";
			game.context.strokeRect(this.x, firstY + this.songPanelHeight * i, this.width, this.songPanelHeight);

			//Song name text
			game.context.fillStyle = "rgba(255, 255, 255, 1.0)";
			game.context.font = this.mainTextSize + "px Arial";
			game.context.fillText(getLoopingFromArray(game.songList, i + this.topIndex).title, this.x + this.textPadding, firstY + this.songPanelHeight * i + this.textPadding);

			//Artist text
			game.context.font = this.mainTextSize / 2 + "px Arial";
			game.context.fillText(getLoopingFromArray(game.songList, i + this.topIndex).artist, this.x + this.textPadding, this.mainTextSize + firstY + this.songPanelHeight * i + this.textPadding * 2);
			//Chart author text
			game.context.fillText(getLoopingFromArray(game.songList, i + this.topIndex).author, this.x + this.textPadding, this.mainTextSize * 1.5 + firstY + this.songPanelHeight * i + this.textPadding * 3);
		}
	}

	get x() {
		return game.context.canvas.width - game.context.canvas.width / 3;
	}

	get width() {
		return game.context.canvas.width / 3;
	}

	get songPanelHeight() {
		return this.textPadding * 4 + this.mainTextSize * 2;
	}

	get songPanelFitCount() {
		return Math.ceil(this.pos.h / this.songPanelHeight);
	}

	get songPanelCount() {
		if (game.songList.length < this.songPanelFitCount) {
			return game.songList.length;
		}
		else {
			return this.songPanelFitCount;
		}
	}

	get totalSongPanelHeight() {
		return this.songPanelCount * this.songPanelHeight;
	}

	get firstSongPanelY() {
		return this.pos.y + this.pos.h / 2 - this.totalSongPanelHeight / 2;
	}

	set relativeSelectionIndex(relIndex) {
		this.selectionIndex += relIndex;

		if (this.selectionIndex < this.topIndex + this.selectionPadding) {
			this.topIndex = this.selectionIndex - this.selectionPadding;
		}
		else if (this.selectionIndex + 1 > this.topIndex + (this.songPanelCount - this.selectionPadding)) {
			this.topIndex = this.selectionIndex + 1 - (this.songPanelCount - this.selectionPadding);
		}
	}
}