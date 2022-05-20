import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FLOOR_HEIGHT, GRASS_ASSET, ROAD_TYPES } from "./constants";

export function createScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 400);
    const renderer = new THREE.WebGLRenderer({
        antialias: false,
        canvas: document.querySelector("#bg")
    });
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 60;
    camera.position.y = 45;
    renderer.render(scene, camera);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    
    function animate(){
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    return scene;
}

const loader = new GLTFLoader();

export function renderBuilding(x, y, z, building, scene){
	for(let i = 0; i < building.value; i++){
		let assetToLoad = "";
		if(i === 0) assetToLoad = building.building.groundUrl; // Load ground tile
		else if(i === building.value-1) assetToLoad = building.building.roofUrl; // Load roof tile
		else assetToLoad = building.building.floorUrl; // Load floor tile
        if(assetToLoad == null || assetToLoad == "") return;

		loader.load(`./assets/${assetToLoad}`, function (gltf) {
            let isLShaped = building.type === 2;
            let extraShift = isLShaped ? 2 * (building.dir % 2) : 0;
            let extraAngle = 0;

            gltf.scene.position.y = 2 * y + i * FLOOR_HEIGHT * 2;
            gltf.scene.position.x = 2 * x + extraShift;
            gltf.scene.position.z = 2 * z + extraShift;
            if(building.mirror){
                gltf.scene.scale.z *= -1; // mirror the object
                extraAngle = 270; // add extra angle to compensate shift from mirroring
            }
            gltf.scene.rotation.y = THREE.Math.degToRad(-90 * (building.dir + (isLShaped ? 2 : 0)) - extraAngle);

			scene.add(gltf.scene);
		}, undefined, function (error) {
			console.error(error);
		} );
	}
}

export function renderRoad(x, y, z, road, scene){
    let assetToLoad = "";
    if(road.type === 0) assetToLoad = ROAD_TYPES[0]; // 2 way road
    else if(road.type === 1) assetToLoad = ROAD_TYPES[1]; // 3 way road
    else if(road.type === 2) assetToLoad = ROAD_TYPES[2]; // 4 way road
    else if(road.type === 3) assetToLoad = ROAD_TYPES[3]; // 2 way turn
    if(assetToLoad == null || assetToLoad == "") return;

    loader.load(`./assets/${assetToLoad}`, function (gltf) {
        gltf.scene.position.y = y;
        gltf.scene.position.x = 2 * x;
        gltf.scene.position.z = 2 * z;
        gltf.scene.rotation.y = THREE.Math.degToRad(-90 * road.dir);

        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    } );
}

export function renderGrass(x, y, z, scene){
    let assetToLoad = GRASS_ASSET;

    loader.load(`./assets/${assetToLoad}`, function (gltf) {
        gltf.scene.position.y = y;
        gltf.scene.position.x = 2 * x;
        gltf.scene.position.z = 2 * z;
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    } );

    // 1/3 chance to render a tree at random pos within the tile
}