import { createScene, renderBuilding, renderRoad, renderGrass, clearScene } from "./scene";
import { initializeTiles, findTiles, getTileTypes } from "./algo";
import { fetchContributions, getConvertedContributions } from "./api";
import { INIT_CONTRIBUTIONS } from "./constants";

// Get HTML elements
const autoRotateButton = document.getElementById("autorotate");
const yearSelect = document.getElementById("yearSelect");
const usernameInput = document.getElementById("usernameInput");
const infoForm = document.getElementById("infoForm");
const selectionScreen = document.getElementById("selectionScreen");
const titleLink = document.getElementById("title");
const displayInfo = document.getElementById("displayInfo");

// Populate year select with years down to 2008
const currentYear = new Date().getFullYear();
for(let y = currentYear; y >= 2008; y--){
	let option = document.createElement("option");
	option.value = y;
	option.innerHTML = y;
	yearSelect.appendChild(option);
}

// Create 3D environment
const { scene, controls } = createScene();
const renderShiftX = -26; 
const renderShiftY = -4;
const renderShiftZ = 0.38;

let enteredInfo = false;

const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get("name") && urlParams.get("year")) {
	// Generate city with url params
	enteredInfo = true;
	selectionScreen.classList.add("hidden");
	let name = urlParams.get("name");
	let year = urlParams.get("year");
	await generateCityFromParams(name, year);
}
else{
	// Placeholder city
	generateCity(INIT_CONTRIBUTIONS);
}


/* - - Input events - - */
// Set autorotations
autoRotateButton.onclick = (e) => {
	e.preventDefault();
	controls.autoRotate = !controls.autoRotate;
	if(controls.autoRotate) autoRotateButton.classList.remove("inactive");
	else autoRotateButton.classList.add("inactive");
}

// Submit form, get data and generate city
infoForm.onsubmit = async (e) => {
	e.preventDefault();
	selectionScreen.classList.add("hidden");
	let name = usernameInput.value;
	let year = yearSelect.value;
	enteredInfo = true;
	let tempArray = window.location.href.split("?");
    let baseURL = tempArray[0];
	let newUrl = `${baseURL}?name=${name}&year=${year}`;
	window.history.replaceState('', '', newUrl);
	await generateCityFromParams(name, year);
}

// Open UI back, start autorotation
titleLink.onclick = (e) => {
	e.preventDefault();
	if(!selectionScreen.classList.contains("hidden") && enteredInfo){
		selectionScreen.classList.add("hidden");
	}
	else{
		selectionScreen.classList.remove("hidden");
		controls.autoRotate = true;
	}

	if(controls.autoRotate) autoRotateButton.classList.remove("inactive");
	else autoRotateButton.classList.add("inactive");
}


async function generateCityFromParams(name, year) {
	displayInfo.innerHTML = `<span>${name}</span> <span>${year}</span>`;

	// Get data from API
	let apiContribs = await fetchContributions(name, year);
	if(apiContribs == null) {
		// Todo: show error message
		throw new Error("Data bad :(");
	}

	// Convert data to 2D array
	let contribs = getConvertedContributions(apiContribs);

	// Render data 
	generateCity(contribs);
}

// Get the 2D array containing contributions and make stuff happen
function generateCity(contribs) {
	// Reset city
	clearScene(scene);

	// Initialize city layout for initial view
	initializeTiles(contribs);
	findTiles();
	const tileTypes = getTileTypes();

	// Render city
	for(let i = 0; i < tileTypes.length; i++){
		for(let j = 0; j < tileTypes[0].length; j++){
			let tileType = tileTypes[i][j];
			let x = 2 * (j + renderShiftX) * 1.1;
			let z = 2 * (i + renderShiftY) * 1.1;
			if(tileType.tile === 0){ // Render grass tiles
				renderGrass(x, 0, z, scene);
			}
			else if(tileType.tile === 1){ // Render road tiles
				renderRoad(x, -.015, z, tileTypes[i][j], scene);
			}
			else if(tileType.tile === 2){ // Render building tiles
				renderBuilding(x, 2 * renderShiftZ, z, tileTypes[i][j], scene); 
			}
		}
	}
}
