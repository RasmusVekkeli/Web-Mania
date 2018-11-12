/*
 * Class containing a scroll speed change
 * 
 * Properties:
 * time: Time point in milliseconds from start of chart which marks the point of speed change
 * scrollMult: Scroll speed multiplier
*/
class ScrollSpeedPoint {
	constructor(time, scrollMult = 1.0) {
		this.time = time;
		this.scrollMult = scrollMult;
	}
}