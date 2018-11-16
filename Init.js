//Add code and function calls here that need to be executed on start.

//Add event listener for browser window resizes and fullscreen changes and resize the canvas's container when it occurs
addEventListener("resize", ReSize);
addEventListener("fullscreenchange", ReSize);

//Create global game object
var game = new Game();

game.Start();