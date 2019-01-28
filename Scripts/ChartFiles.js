/*
 * Class storing index positions to all required files of a single chart in the file list
 * 
 * Properties:
 * dataIndex: Index number to the actual chart file
 * audioIndex: Index number to the audio file
 * bgIndex: Index number to the bg image file
 * chartName: Name of chart
 * keyCount: Number of keys in chart
 * 
 * Constructor parameters:
 * dataIndex: index of the data file in game.directorySelector.files array
 * audioIndex: index of the audio file in game.directorySelector.files array
 * bgIndex: index of the background image file in the game.directorySelector.files array
 * chartName: difficulty name of the chart
 * keyCount: number of keys in chart
*/
class ChartFiles {
	constructor(dataIndex, audioIndex = null, bgIndex = null, chartName = "", keyCount = 0) {
		this.dataIndex = dataIndex;
		this.audioIndex = audioIndex;
		this.bgIndex = bgIndex;
		this.chartName = chartName;
		this.keyCount = keyCount;
	}
}