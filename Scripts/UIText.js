class UIText extends GameObject{
	constructor(text, x, y, anchorX, anchorY, size = 10, fontFamily = "Arial") {
		super(false, false, true);

		this.anchor = { x: anchorX, y: anchorY }; //-1: left/top, 0: middle/middle, 1: right/bottom
		this.text = text === undefined ? "" : text;
		this.textStyle = "";
		this.size = size;
		this.fontFamily = fontFamily;
		this.pos = new Rect(x, y, undefined, undefined, true);
	}

	Draw() {
		if (this.anchor.x < 0) {
			game.context.textBaseline = "top";
		}
		else if (this.anchor.x > 0) {
			game.context.textBaseline = "bottom";
		}
		else {
			game.context.textBaseline = "middle";
		}

		if (this.anchor.y < 0) {
			game.context.textAlign = "left";
		}
		else if (this.anchor.y > 0) {
			game.context.textAlign = "right";
		}
		else {
			game.context.textAlign = "center";
		}

		game.context.fillStyle = this.textStyle;
		game.context.font = this.size + "px " + this.fontFamily;

		game.context.fillText(this.text, this.pos.x, this.pos.y);
	}

	Update() {

	}
}