import * as THREE from "three";
import { MeshBasicMaterial } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CONTRIBS, BUILDING_TYPES, FLOOR_HEIGHT } from "./constants";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 400);
const renderer = new THREE.WebGLRenderer({
	antialias: false,
    canvas: document.querySelector("#bg")
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 30;
camera.position.y = 30;
renderer.render(scene, camera);

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(20, 20, 20);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

function animate(){
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();

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

const loader = new GLTFLoader();

function renderBuilding(x, y, z, building){
	for(let i = 0; i < building.value; i++){
		let assetToLoad = "";
		if(i === 0){ // Load ground tile
			assetToLoad = building.building.groundUrl;
		}
		else if(i === building.value-1){ // Load roof tile
			assetToLoad = building.building.roofUrl;
		}
		else{ // Load floor tile
			assetToLoad = building.building.floorUrl;
		}
		loader.load(`./assets/${assetToLoad}`, function (gltf) {
			gltf.scene.position.x = x;
			gltf.scene.position.y = y + i * FLOOR_HEIGHT * 2;
			gltf.scene.position.z = z;
			scene.add(gltf.scene);
		}, undefined, function (error) {
			console.error(error);
		} );
	}

}

let tileTypes = [];
let seenTiles = [];

for(let i = 0; i < CONTRIBS.length; i++){
	let seenRow = [];
	let typesRow = [];
	for(let j = 0; j < CONTRIBS[0].length; j++){
		seenRow.push(0);
		typesRow.push(-1);
	}
	tileTypes.push(typesRow);
	seenTiles.push(seenRow);
}

for(let i = 0; i < CONTRIBS.length; i++){
	for(let j = 0; j < CONTRIBS[0].length; j++){
		if(CONTRIBS[i][j] >= 3){
			tileTypes[i][j] = {x:j, y:i, type: 0, value: CONTRIBS[i][j], building: BUILDING_TYPES[0][0], dir: 0, tiles: [{x:j,y:i}]};
		}
	}
}


for(let i = 0; i < tileTypes.length; i++){
	for(let j = 0; j < tileTypes[0].length; j++){
		if(tileTypes[i][j] !== -1){
			renderBuilding(j+j*1.8-28, 0, i+i*1.8, tileTypes[i][j]); //Math.random()>0.8 ? 0.8 : 16
		}
	}
}