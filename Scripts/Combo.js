class Combo extends GameObject{
	constructor() {
		super(false, false, true);

		this.pos = new Rect(0, 480, 0, 0, true);

		this.comboNumber = new UIText("", 0, 300, 0, 1, 40, "Arial");
		this.comboText = new UIText("COMBO", 0, 305, 0, -1, 30, "Arial");

		this.margin = 0;

		this.comboNumber.textStyle = "#FFFFFF";
	}

	Update() {
		//Update X of both text elements to the center of the playfield
		this.pos.x = game.playfield.pos.x + game.playfield.width / 2;
		this.comboNumber.pos.x = this.comboText.pos.x = this.pos.x;

		this.comboNumber.pos.y = this.pos.y;
		this.comboText.pos.y = this.pos.y + this.margin;

		this.comboNumber.text = game.currentCombo;
	}

	Draw() {
		this.comboNumber.Draw();
		this.comboText.Draw();
	}
}