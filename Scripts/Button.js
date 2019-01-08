class Button extends GameObject {
	constructor(onClick, rect) {
		super(false, false, true);

		this.pos = rect;
		this.onClick = onClick;
	}

	click() {
		this.onClick();
	}

	IsInsideButton(x, y) {
		if (x <= this.pos.x + this.pos.w &&
			x >= this.pos.x &&
			y <= this.pos.y + this.pos.h &&
			y >= this.pos.y) {
			return true;
		}
		else {
			return false;
		}
	}
}