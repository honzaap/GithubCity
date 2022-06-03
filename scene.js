/*
 *  Functions for rendering the city
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { BEACH_ASSET, FLOOR_HEIGHT, GRASS_ASSET, ROAD_TYPES, SEA_ASSET } from "./constants";

// Global GLTF loader
const loader = new GLTFLoader();

export function createScene() {
    // Create scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 400);
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector("#bg")
    });
    
    // Configure scene and camera
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.position.z = 60;
    camera.position.y = 45;

    renderer.render(scene, camera);
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Setup postprocessing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Ambient lighting 
    const ambientLight = new THREE.AmbientLight(0x202020);
    scene.add(ambientLight);

    // Directional lighting
    const directionLight = new THREE.DirectionalLight(0xf0e8c0);
    directionLight.position.set(-30, 50, 40);
    scene.add(directionLight);

    // Todo: add a background
    const sceneBackground = new THREE.Color(0xfff6e0);
    scene.background = sceneBackground;

    // Render beach
    loader.load(`./assets/${BEACH_ASSET}`, function(gltf) {
        const beach = gltf.scene;
        beach.position.y = -1;
        beach.position.x = -5;
        beach.position.z = 5;
        scene.add(beach);
    });

    // Render and animate the sea
    let seaMixer;
    loader.load(`./assets/${SEA_ASSET}`, function(gltf) {
        const sea = gltf.scene;
        sea.position.y = -5;
        scene.add(sea);
        seaMixer = new THREE.AnimationMixer(sea);
        const clips = gltf.animations;
        const action = seaMixer.clipAction(clips[0]);
        action.play();
    });
    
    const clock = new THREE.Clock();

    // Animation loop
    function animate(){
        if(seaMixer) seaMixer.update(clock.getDelta());
        requestAnimationFrame(animate);
        controls.update();
        composer.render();
    }
    animate();

    return scene;
}

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

    // TODO: 1/3 chance to render a tree at random pos within the tile
}