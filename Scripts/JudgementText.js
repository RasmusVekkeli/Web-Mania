class JudgementText extends UIText{
	constructor() {
		super("", 0, 640, 0, 0, 60, "Arial");

		this.animationStart = 0;
		this.animationLength = 60;

		this.smallSize = this.size;
		this.largeSize = 70;

		this.time = performance.now();

		this.textStyle = "#FFFFFF";
	}

	Animate() {
		this.animationStart = performance.now();
	}

	Update() {
		if (this.skipUpdate) {
			return;
		}

		this.time = performance.now();

		let adjustedT;

		if (this.t < 0.5) {
			adjustedT = this.t * 2;
		}
		else {
			adjustedT = 0.5 - (this.t - 0.5);
		}

		this.size = this.smallSize + (this.largeSize - this.smallSize) * adjustedT;

		this.text = game.lastJudgement.judgeText;

		this.pos.x = game.playfield.pos.x + game.playfield.width / 2;

		this.skipDraw = game.state !== 4;
	}

	get t() {
		let t = (this.time - this.animationStart) / this.animationLength;

		if (t < 0) {
			t = 0;
		}

		if (t > 1) {
			t = 1;
		}

		return t;
	}
}