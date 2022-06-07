/*
 *  Things that handle all the 3D stuff 
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { FLOOR_HEIGHT, GRASS_ASSET, ROAD_TYPES, ENVIRONMENT_ASSET, CLOUD_ASSET } from "./constants";

// Global GLTF loader
const loader = new GLTFLoader();

export function createScene() {
    // Create scene
    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer(scene, camera);

    setupLighting(scene);

    setupEnvironment(scene);

    const controls = createControls(camera, renderer);

    const updateClouds = createClouds(scene);
    
    setBoundaries(scene);

    const composer = setupPostProcessing(scene, camera, renderer);

    // Animation loop
    function animate(){
        requestAnimationFrame(animate);
        controls.update();
        updateClouds();
        composer.render();
    }
    animate();

    return scene;
}

// Set shadows on given object to given settings
function setShadow(obj, cast = false, receive = false){
    obj.castShadow = cast;
    obj.receiveShadow = receive;    
    if(obj?.children != null){
        for(let child of obj.children){
            setShadow(child, cast, receive);
        }
    }
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

            setShadow(gltf.scene, true, false);

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

        setShadow(gltf.scene, false, true);

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

        setShadow(gltf.scene, false, true);

        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    } );

    // TODO: 1/3 chance to render a tree at random pos within the tile
}

// Create and cofigure camera and return it 
function createCamera() {
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 30, 51);

    return camera;
}

// Create and configure renderer and return it 
function createRenderer(scene, camera) {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector("#bg")
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.render(scene, camera);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return renderer;
}

// Create and configure controls and return it 
function createControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = false; // Todo: Bind to a toggle button
    controls.autoRotateSpeed = -2;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 30;
    controls.maxDistance = 150;

    return controls;
}

// Configure postprocessing and return composer
function setupPostProcessing(scene, camera, renderer) {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    return composer;
}

// Create and configure lighting in the scene  
function setupLighting(scene) {
    // Ambient lighting 
    const ambientLight = new THREE.AmbientLight(0x202020);
    scene.add(ambientLight);

    // Directional lighting and shadows
    const directionLight = new THREE.DirectionalLight(0xf5f5f5);
    directionLight.position.set(-50, 50, -20);
    directionLight.castShadow = true;
    directionLight.shadow.mapSize.x = 512; // Tweak for best quality/performace settings
    directionLight.shadow.mapSize.y = 512; // Tweak for best quality/performace settings
    directionLight.shadow.camera.near = 0.1;
    directionLight.shadow.camera.far = 400.0;
    directionLight.shadow.camera.right =  50;
    directionLight.shadow.camera.left = -50;
    directionLight.shadow.camera.top =  50;
    directionLight.shadow.camera.bottom = -50;
    scene.add(directionLight);
}

// Create and setup anything environment-related 
function setupEnvironment(scene) {
    const sceneBackground = new THREE.Color(0xffffff);
    scene.background = sceneBackground;

    // Render environment (ground)
    loader.load(`./assets/${ENVIRONMENT_ASSET}`, function(gltf) {
        const env = gltf.scene;
        env.position.set(0, -4, 0);
        setShadow(gltf.scene, false, true);
        scene.add(env);
    });
}

// Create and add boundaries around environment into scene
function setBoundaries(scene){
    // the inside of the hole
    let geoH = new THREE.BoxGeometry(120, 60, .1);
    let geoV = new THREE.BoxGeometry(0.1, 60, 120);
    let material = new THREE.MeshLambertMaterial({
        transparent : true,
        color: 0xffffff,
        side: THREE.FrontSide,
        emissive: 0xffffff
    }); 

    // Front 👆
    let sidesFront = [null,null,null,null,material,null];
    let boundaryFront = new THREE.Mesh(geoH, sidesFront);
    boundaryFront.position.set(0, 30, -60);
    scene.add(boundaryFront);

    // Back 👇
    let sidesBack = [null,null,null,null,null,material];
    let boundaryBack = new THREE.Mesh(geoH, sidesBack);
    boundaryBack.position.set(0, 30, 60);
    scene.add(boundaryBack);

    // Right 👉
    let sidesRight = [null,material,null,null,null,null];
    let boundaryRight = new THREE.Mesh(geoV, sidesRight);
    boundaryRight.position.set(60, 30, 0);
    scene.add(boundaryRight);

    // Left 👈
    let sidesLeft = [material,null,null,null,null,null];
    let boundaryLeft = new THREE.Mesh(geoV, sidesLeft);
    boundaryLeft.position.set(-60, 30, 0);
    scene.add(boundaryLeft);
}

// Creates and animates clouds ☁
function createClouds(scene) {
    let clouds = [];
    const CLOUD_COUNT = 4;
    for(let i = 0; i < CLOUD_COUNT; i++) {
        loader.load(`./assets/${CLOUD_ASSET}`, function(gltf) {
            let cloud = gltf.scene;
            let x = -40 * (Math.random() * 0.3 + 0.8) + (i * (Math.random() * 0.3 + 0.7) * 30)
            let z = -60 + 120 * Math.random();
            let y = 15 + 8 * Math.random();
            cloud.position.set(x, y, z);
            cloud.rotation.y = Math.random() * 30;
            gltf.scene.children[0].material.opacity = 0.8;
            gltf.scene.children[0].material.transparent = true;

            setShadow(cloud, false, false);
            cloud.fadeOut = () => {
                cloud.position.set(x, y, 70);
            }

            clouds.push(cloud);
            scene.add(cloud);
        });
    }
    const updateClouds = () => {
        for(let cloud of clouds){
            cloud.position.z -= 0.04;
            if(cloud.position.z <= -65){
                cloud.fadeOut();
            }
        } 
    }
    return updateClouds;
}