class ProgressBar extends GameObject {
	constructor(rect, color) {
		super(false, false, true);

		this.pos = rect;
		this.color = color;
		this.t = 0;
	}

	Update() {
		this.t = game.currentProgress / game.endProgress;
	}

	Draw() {
		game.context.fillStyle = this.color;

		game.context.fillRect(this.pos.x, this.pos.y, this.pos.w * this.t, this.pos.h);
	}
}