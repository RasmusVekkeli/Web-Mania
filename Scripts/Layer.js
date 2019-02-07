/*
 * Class for grouping and managing updateable and rederable objects.
 * 
 * Inherits from GameObject class.
 * 
 * Properties: 
 * name: Name as string for the layer. Can be any string. Used for searching for the layer with Game.GetLayerByName function.
 * objectList: Array of updateable (has Update function implemented) and renderable (has Draw function implemented) objects.
 * 
 * Constructor parameters:
 * name: String of desired name for the layer.
 * objects: Array of objects. See objectList property above.
 * 
 * Functions:
 * Update: Calls Update function on all objects in objectList array.
 * Parameters: none
 * 
 * Draw: Calls Draw function on all objects in objectList array.
 * Parameters: none
*/
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