class Combo extends GameObject{
	constructor() {
		super(false, false, true);

		this.pos = new Rect(0, 480, 0, 0, true);

		this.comboNumber = new UIText("", 0, 300, 0, 1, 40, "Arial");
		this.comboText = new UIText("COMBO", 0, 305, 0, -1, 30, "Arial");

		this.margin = 0;

		this.comboNumber.textStyle = "#FFFFFF";

		this.animationStart = 0;
		this.animationLength = 60;

		this.smallSize = this.comboNumber.size;
		this.largeSize = 50;

		this.maxSizeCombo = 10000;
		this.smallMaxComboSizeAdd = 100;
		this.largeMaxComboSizeAdd = 120;

		this.time = performance.now();
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

		let l_size = this.largeSize + this.largeMaxComboSizeAdd * this.size_t;
		let s_size = this.smallSize + this.smallMaxComboSizeAdd * this.size_t;

		this.comboNumber.size = s_size + (l_size - s_size) * adjustedT;

		//Update X of both text elements to the center of the playfield
		this.pos.x = game.playfield.pos.x + game.playfield.width / 2;
		this.comboNumber.pos.x = this.comboText.pos.x = this.pos.x;

		this.comboNumber.pos.y = this.pos.y;
		this.comboText.pos.y = this.pos.y + this.margin;

		this.comboNumber.text = game.currentCombo;
	}

	Draw() {
		if (this.skipDraw || game.state !== 4 || game.currentCombo <= 0) {
			return;
		}

		this.comboNumber.Draw();
		this.comboText.Draw();
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

	get size_t() {
		let t = game.currentCombo / this.maxSizeCombo;

		if (t < 0) {
			t = 0;
		}

		if (t > 1) {
			t = 1;
		}

		return t;
	}
}