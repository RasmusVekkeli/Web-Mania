class Layer extends GameObject {
	constructor(name, objects) {
		super(false, false, true);

		this.name = name;

		if (objects !== undefined) {
			this.objectList = objects;
		}
		else {
			this.objectList = [];
		}
	}

	Update() {
		if (!this.skipUpdate) {
			for (let i = 0; i < this.objectList.length; i++) {
				this.objectList[i].Update();
			}
		}
	}

	Draw() {
		if (!this.skipDraw) {
			for (let i = 0; i < this.objectList.length; i++) {
				this.objectList[i].Draw();
			}
		}
	}
}