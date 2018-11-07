/*
 * Class storing index positions to all required files of a single chart in the file list
 * 
 * dataIndex: Index number to the actual chart file
 * audioIndex: Index number to the audio file
 * bgIndex: Index number to the bg image file
*/
class ChartFiles {
	constructor(dataIndex, audioIndex = null, bgIndex = null) {
		this.dataIndex = dataIndex;
		this.audioIndex = audioIndex;
		this.bgIndex = bgIndex;
	}
}