class SongWheel extends GameObject {
	constructor() {
		super(false, false, true);

		this.textPadding = 3;
		this.topIndex = 0;
		this.selectionIndex = 0;
		this.selectionPadding = 1;
		this.songSelectedIndex = null;
		this.diffSelectionIndex = 0;

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

		//Draw song panels
		let firstY = this.firstSongPanelY;

		game.context.textBaseline = "top";
		game.context.textAlign = "left";

		game.context.fillStyle = "rgba(0, 0, 0, 0.6)";
		game.context.fillRect(this.x, this.pos.y, this.width, this.pos.h);

		let diffsDrawn = false;

		for (let i = 0; i < this.songPanelCount; i++) {
			if (i <= this.selectionPadding || this.songSelectedIndex === null) {
				this.DrawSongPanel(i, firstY);
			}
			else {
				if (!diffsDrawn) {
					for (let j = 0; j < game.songList.getLooping(this.songSelectedIndex).chartList.length; j++) {
						this.DrawDiffPanel(j, firstY);
					}
					diffsDrawn = true;
				}
				this.DrawSongPanel(i, firstY, this.totalDiffPanelHeight);
			}
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

	get diffPanelHeight() {
		return this.textPadding * 2 + this.mainTextSize;
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

	get totalDiffPanelHeight() {
		return this.songSelectedIndex === null ? 0 : game.songList.getLooping(this.songSelectedIndex).chartList.length * this.diffPanelHeight;
	}

	get firstSongPanelY() {
		return this.pos.y + this.pos.h / 2 - this.totalSongPanelHeight / 2;
	}

	set relativeSongSelectionIndex(relIndex) {
		//If there's less than screen filling amount of songs
		if (this.songPanelCount !== this.songPanelFitCount) {
			if (this.selectionIndex + relIndex > game.songList.length - 1 || this.selectionIndex + relIndex < 0) {
				return;
			}

			this.DeSelectSong();

			this.selectionIndex += relIndex;
		}
		//If there's more than screen filling amount of songs
		else {
			this.DeSelectSong();

			this.selectionIndex += relIndex;

			if (this.selectionIndex < this.topIndex + this.selectionPadding) {
				this.topIndex = this.selectionIndex - this.selectionPadding;
			}
			else if (this.selectionIndex + 1 > this.topIndex + (this.songPanelCount - this.selectionPadding)) {
				this.topIndex = this.selectionIndex + 1 - (this.songPanelCount - this.selectionPadding);
			}
		}
	}

	set relativeDiffSelectionIndex(relIndex) {
		if (this.songSelectedIndex !== null) {
			if (this.diffSelectionIndex + relIndex > game.songList.getLooping(this.songSelectedIndex).chartList.length - 1 || this.diffSelectionIndex + relIndex < 0) {
				return;
			}

			this.diffSelectionIndex += relIndex;

			game.LoadSong(this.songSelectedIndex, this.diffSelectionIndex);
		}
	}

	DrawSongPanel(i, firstY, offset = 0) {
		//Selection indicator
		if (i + this.topIndex == this.selectionIndex) {
			game.context.fillStyle = "rgba(255, 255, 255, 0.3)";
			game.context.fillRect(this.x, firstY + this.songPanelHeight * i + offset, this.width, this.songPanelHeight);
		}

		//Panel border
		game.context.strokeStyle = "rgba(255, 255, 255, 1.0)";
		game.context.strokeRect(this.x, firstY + this.songPanelHeight * i + offset, this.width, this.songPanelHeight);

		//Song name text
		game.context.fillStyle = "rgba(255, 255, 255, 1.0)";
		game.context.font = this.mainTextSize + "px Arial";
		game.context.fillText(game.songList.getLooping(i + this.topIndex).title, this.x + this.textPadding, firstY + this.songPanelHeight * i + this.textPadding + offset);

		//Artist text
		game.context.font = this.mainTextSize / 2 + "px Arial";
		game.context.fillText(game.songList.getLooping(i + this.topIndex).artist, this.x + this.textPadding, this.mainTextSize + firstY + this.songPanelHeight * i + this.textPadding * 2 + offset);
		//Chart author text
		game.context.fillText(game.songList.getLooping(i + this.topIndex).author, this.x + this.textPadding, this.mainTextSize * 1.5 + firstY + this.songPanelHeight * i + this.textPadding * 3 + offset);
	}

	DrawDiffPanel(diffIndex, firstY) {
		let offset = firstY + this.songPanelHeight + this.songPanelHeight * this.selectionPadding;
		let diff = game.songList.getLooping(this.songSelectedIndex).chartList[diffIndex];

		if (this.diffSelectionIndex == diffIndex) {
			game.context.fillStyle = "rgba(255, 255, 255, 0.3)";
			game.context.fillRect(this.x, offset + diffIndex * this.diffPanelHeight, this.width, this.diffPanelHeight);
		}

		let keyCountText = "[" + diff.keyCount + (diff.keyCount == 1 ? " key] " : " keys] ");
		game.context.font = this.mainTextSize + "px Arial";

		game.context.fillStyle = "#FFE500";
		game.context.fillText(keyCountText, this.x + this.textPadding, offset + this.textPadding + diffIndex * this.diffPanelHeight);

		game.context.fillStyle = "#FFFFFF";
		game.context.fillText(diff.chartName, this.x + this.textPadding + game.context.measureText(keyCountText).width, offset + this.textPadding + diffIndex * this.diffPanelHeight);
	}

	SelectSong() {
		this.songSelectedIndex = this.selectionIndex;
		this.topIndex = this.songSelectedIndex - this.selectionPadding;
		this.diffSelectionIndex = 0;
		game.LoadSong(this.songSelectedIndex, this.diffSelectionIndex);
	}

	DeSelectSong() {
		this.songSelectedIndex = null;
	}

	Selecter() {
		if (this.songSelectedIndex === null) {
			this.SelectSong();
		}
		else {
			game.Play();
		}
	}
}