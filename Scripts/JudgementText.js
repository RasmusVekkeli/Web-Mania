/*
 * Class for drawing and animating the judgement text ("Marvelous!!", "Perfect!", "Miss" etc.) during gameplay.
 * 
 * Inherits from UIText class
 * 
 * Properties:
 * animationStart: Holds the timestamp of the start of the animation
 * animationLength: Determines the length of the animation in milliseconds
 * smallSize: Smallest size for the text itself in pixels
 * largeSize: Largest size for the text in pixels (if this value is the same as smallSize, it effectively removes the animation)
 * time: Holds the current time used for animation calculations
 * textStyle: Holds the text style (color) used for the text
 * 
 * Constructor parameters: none
 * 
 * Functions:
 * Animate: Starts the animation. Sets the animationStart to current time.
 * Update: Calculates animation sizes and sets the object's size to it, updates the text used for the drawing.
 * 
 * get t: Returns linear interpolation value between animation lenght and current animation time.
*/
class JudgementText extends UIText {
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