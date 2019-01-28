/*
 * Class which handles the combo UI element
 * 
 * Inherits from GameObject class
 * 
 * Properties:
 * pos: A Rect object which is used for positioning the element on screen. Only pos.y can be changed with effect.
 * comboNumber: An UIText object used for the combo number part of the combo element
 * comboText: An UIText object used for the literal "COMBO" text under the combo number
 * margin: A margin in pixels between the combo number and the "COMBO" text
 * animationStart: A timestamp that marks start of last animation
 * animationLenght: Total lenght of animation in milliseconds
 * smallSize: Smallest size of the combo number, normal size (animation size)
 * largeSize: Largest size of the combo number, peak animation size (animation size)
 * maxSizeCombo: Determines at what combo the number will be the largest (combo multiplier size)
 * smallMaxComboSizeAdd: Determines the amount added to smallSize value at maxSizeCombo
 * largeMaxComboSizeAdd: Determines the amount added to largeSize value at maxSizeCombo
 * time: Marks current time. Updates in Update-function.
 * 
 * Constructor properties: none
 * 
 * 
 * Functions:
 * Animate: Sets animationStart at current time resulting in animation in Draw function
 * Parameters: none
 * 
 * 
 * Update: Updates various variables each frame of the game
 * Parameters: none
 * 
 * 
 * Draw: Draws the element on screen
 * Parameters: none
 * 
 * 
 * get t: Returns a linear interpolation value between 0 and 1 for animation
 * 
 * 
 * get size_t: Returns a linear interpolation value between 0 and 1 for combo size additions
 */
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

	get size_t() { //c++ intesifies
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