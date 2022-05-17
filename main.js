import * as THREE from "three";
import { createScene, renderBuilding, renderRoad } from "./scene";
import { initializeTiles, findTiles, getTileTypes } from "./algo";
import { CONTRIBS, BUILDING_TYPES, FLOOR_HEIGHT } from "./constants";

// Create 3D environment
const scene = createScene();
const renderShift = -28; 

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(20, 20, 20);
scene.add(ambientLight);

const sceneBackground = new THREE.Color(0xfff6e0);
scene.background = sceneBackground;

const groundTexture = new THREE.MeshBasicMaterial({color: 0xc7c7c7});
const ground = new THREE.Mesh(
	new THREE.BoxGeometry(60, 1, 10),
	groundTexture
);
ground.position.x = 0;
ground.position.z = 3;
//scene.add(ground);

initializeTiles();

findTiles();

const tileTypes = getTileTypes();

for(let i = 0; i < tileTypes.length; i++){
	for(let j = 0; j < tileTypes[0].length; j++){
		let tileType = tileTypes[i][j];
		if(tileType.tile === 0){
			// Render Grass
		}
		if(tileType.tile === 1){
			// Render Road
			renderRoad(j + renderShift, -0.7, i, tileTypes[i][j], scene);
		}
		if(tileType.tile === 2){
			// Render Building
			renderBuilding(j + renderShift, 0, i, tileTypes[i][j], scene); 
		}
	}
}