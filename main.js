import { createScene, renderBuilding, renderRoad, renderGrass } from "./scene";
import { initializeTiles, findTiles, getTileTypes } from "./algo";
import { fetchContributions, getConvertedContributions } from "./api";

// Create 3D environment
const scene = createScene();
const renderShiftX = -26; 
const renderShiftY = -4;
const renderShiftZ = 0.35;

//scene.add(ground);

// 1. Get data from API
// Todo: make form for username and year
let apiContribs = await fetchContributions("honzaap", 2022);
if(apiContribs == null) {
	// Todo: show error message
	throw new Error("Data bad :(");
}
let contribs = getConvertedContributions(apiContribs);

// For testing 
//const contribs = [[1,1,0,0,2,2,2,3,1,2,2,0,2,0,0,2,2,2,0,0,0,1,0,3,1,1,2,0,1,2,1,2,0,1,2,2,1,1,0,1,1,1,2,1,0,2,2,0,2,0,1,2,0],[2,2,2,1,2,0,1,0,2,3,3,2,0,1,0,2,2,2,0,2,1,1,2,2,3,1,0,1,1,2,2,1,2,2,1,3,2,2,0,2,1,1,2,2,2,0,1,1,2,1,0,1,0],[1,2,2,3,2,1,1,0,1,0,2,2,3,1,1,1,1,0,0,0,0,3,1,0,3,1,1,1,1,1,1,2,0,2,2,2,0,0,4,2,0,1,2,2,0,2,2,1,2,0,1,1,2],[2,2,0,1,2,1,2,1,1,2,4,1,1,0,0,0,1,1,2,2,1,1,2,3,3,0,0,2,2,4,4,1,0,0,1,2,2,0,0,0,0,3,1,0,0,0,2,2,2,1,2,4,2],[2,0,2,2,0,1,0,1,1,2,2,1,0,2,1,1,2,2,0,1,1,0,2,0,2,2,2,0,1,0,0,0,2,0,1,1,2,1,1,0,0,0,1,0,0,0,2,1,0,1,2,2,2],[0,1,2,0,0,2,2,1,2,1,3,0,0,1,2,4,0,0,1,1,1,0,0,2,2,2,2,0,1,2,0,0,1,0,2,2,0,0,1,1,1,1,2,2,0,0,0,1,2,3,1,2,1],[0,0,0,3,3,0,0,0,0,2,0,1,2,2,1,2,1,2,2,2,1,0,2,0,1,0,0,2,1,1,2,0,2,0,0,0,1,0,4,4,2,2,0,2,0,0,1,1,0,2,1,2,1]]
//const contribs = [[2,4,7,0,7,4,6,0,0,3,7,5,3,7,5,6,6,17,5,2,4,2,7,5,2,6,7,3,0,5,4,6,5,2,7,0,0,0,7,0,0,7,3,2,7,6,0,0,2,2,6,1,3],[7,5,5,1,6,4,2,6,0,6,5,3,3,1,2,7,6,7,0,1,0,1,1,0,2,6,0,1,0,0,5,6,6,0,2,1,0,4,0,0,1,2,2,7,0,5,0,6,1,1,4,3,5],[4,2,5,3,2,3,6,4,1,6,0,0,6,1,1,4,4,4,6,5,0,2,7,7,1,4,1,5,3,1,5,5,4,0,0,2,3,2,0,1,0,1,2,0,2,0,4,3,0,4,0,0,0],[1,6,3,0,4,4,4,5,5,0,7,4,1,3,2,7,2,0,4,4,0,6,0,5,7,0,2,2,0,6,2,7,1,4,0,4,3,1,7,0,2,4,7,0,0,1,5,2,2,0,0,0,0],[5,0,4,5,0,3,4,0,5,5,7,5,2,6,7,0,0,5,0,2,0,4,0,4,3,2,7,7,0,6,0,2,6,0,5,1,3,7,3,1,0,2,6,0,1,4,1,2,3,6,1,6,0],[5,6,6,7,7,3,2,0,1,2,1,1,5,6,1,5,2,0,4,6,0,4,6,0,5,3,0,5,4,5,5,2,6,1,7,0,6,0,4,0,1,7,0,0,6,0,6,4,7,6,6,0,0],[3,6,1,6,2,0,1,1,4,0,7,2,2,5,2,0,4,7,5,2,7,4,1,0,0,2,7,1,5,2,5,0,6,0,2,4,1,4,6,0,0,7,6,5,4,6,0,4,1,5,2,5,1]]

// 2. Initialize city layout
initializeTiles(contribs);
findTiles();
const tileTypes = getTileTypes();

// 3. Render city
for(let i = 0; i < tileTypes.length; i++){
	for(let j = 0; j < tileTypes[0].length; j++){
		let tileType = tileTypes[i][j];
		if(tileType.tile === 0){ // Render grass tiles
			renderGrass(j + renderShiftX, 0, i + renderShiftY, scene);
		}
		else if(tileType.tile === 1){ // Render road tiles
			renderRoad(j + renderShiftX, 0, i + renderShiftY, tileTypes[i][j], scene);
		}
		else if(tileType.tile === 2){ // Render building tiles
			renderBuilding(j + renderShiftX, renderShiftZ, i + renderShiftY, tileTypes[i][j], scene); 
		}
	}
}