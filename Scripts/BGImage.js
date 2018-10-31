/*
 * Class for updating and rendering the background image
 * 
 * Inherits from GameObject class
 * 
 * imageObject: HTML image element which contains the image. The image should be loaded before passing it to the class.
 * pos: Rect object which stores the image's position and dimensions for rendering.
 * 
 * Constructor parameters:
 * htmlImageElement: a HTML image element, can be get using basic "getElement"-functions or the Image constructor. This image element has to have source and has to be loaded
 * skipUpdate: Sets the object to ignore Update calls if true
 * skipDraw: Sets the object to ignore Draw calls if true
 * skipTypeCheck: Skips parameter type validation if true. Should only be true in class constructors that inherit from this class
 * 
 * 
 * Functions:
 * Update: This function does nothing. It is here to overwrite GameObject class's Update function to avoid unintended "not implemented" errors.
 * Update function parameters:
 * none
 * 
 * 
 * Draw: This function draws the background image if present and if skipDraw is not set to true
 * Draw function parameters:
 * none
 * 
 * 
 * CalculateImageCoordinates: Calculates the centered image position and scaling for rendering and stores it in pos-property
 * CalculateImageCoordinates function parameters:
 * none
*/
class BGImage extends GameObject {
	constructor(htmlImageElement, skipUpdate = false, skipDraw = false, skipTypeCheck = false) {
		if (!skipTypeCheck) {
			const expectedParameterTypes = ["object", "boolean", "boolean", "any"];
			ValidateParameterTypes(arguments, expectedParameterTypes);
		}

		super(skipUpdate, skipDraw, true);

		this.imageObject = htmlImageElement;
		this.pos = new Rect();

		this.CalculateImageCoordinates();
	}

	Update() {

	}

	Draw() {
		if (!this.skipDraw) {
			game.context.drawImage(this.imageObject, this.pos.x, this.pos.y, this.pos.w, this.pos.h);
		}
	}

	CalculateImageCoordinates() {
		if (this.imageObject && this.imageObject.complete) {
			const imageAspect = this.imageObject.naturalWidth / this.imageObject.naturalHeight;

			if (imageAspect > game.aspectRatio) {
				this.pos.h = game.context.canvas.height;
				this.pos.w = game.context.canvas.height * imageAspect;

				this.pos.y = 0;
				this.pos.x = (game.context.canvas.width - this.pos.w) / 2;
			}
			else {
				this.pos.w = game.context.canvas.width;
				this.pos.h = game.context.canvas.width / imageAspect;

				this.pos.y = (game.context.canvas.height - this.pos.h) / 2;
				this.pos.x = 0;

				console.log(this.pos.h.toString() + " " + game.context.canvas.height);
			}
		}
	}
}