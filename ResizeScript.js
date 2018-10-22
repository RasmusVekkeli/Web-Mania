//Applies top margin to the canvas's container to center the canvas vertically
function ReSize() {
	var rect = document.getElementById("main_container");

	rect.style.marginTop = ((window.innerHeight - rect.offsetHeight) / 2) + "px";
}