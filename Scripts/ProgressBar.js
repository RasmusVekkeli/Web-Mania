class ProgressBar extends GameObject {
	constructor(rect, color) {
		super(false, false, true);

		this.pos = rect;
		this.color = color;
		this.t = 0;
		this.progressText = new UIText("", this.pos.x, this.pos.y - 10, -1, 1, 30, "Arial");
	}

	Update() {
		if (this.skipUpdate || game.state !== 2) {
			return;
		}

		this.t = game.currentProgress / game.endProgress;

		this.progressText.text = "Files processed: " + game.currentProgress + " out of " + game.endProgress;
	}

	Draw() {
		if (this.skipDraw || game.state !== 2) {
			return;
		}

		game.context.fillStyle = this.color;

		game.context.fillRect(this.pos.x, this.pos.y, this.pos.w * this.t, this.pos.h);

		this.progressText.Draw();
	}
}