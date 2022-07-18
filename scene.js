/*
 *  Things that handle all the 3D stuff
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer,RenderPass } from "postprocessing";
import { FLOOR_HEIGHT, GRASS_ASSET, ROAD_TYPES, ENVIRONMENT_ASSET, ENVIRONMENT_OBJECTS_ASSET, TREES_SMALL, ENVIRONMENT_ANIMATED_ASSET } from "./constants";

// Global GLTF loader
const loader = new GLTFLoader();

export function createScene() {
    // Create scene
    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer(scene, camera);

    setupLighting(scene);

    const updateMixer = setupEnvironment(scene);

    const controls = createControls(camera, renderer);

    const composer = setupPostProcessing(scene, camera, renderer);

    const clock = new THREE.Clock();

    // Animation loop
    function animate(){
        const delta = clock.getDelta();

        requestAnimationFrame(animate);
        controls.update();
        updateMixer(delta);
        composer.render();
    }
    animate();

    // Resize renderer when window size changes
    window.onresize = () => {
        resizeRenderer(renderer);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    return { scene, controls };
}

export function clearScene(scene){
    let toDelete = ["Building", "Road", "Grass", "Tree"];
    for(let i = scene.children.length - 1; i >= 0; i--){
        if(toDelete.includes(scene.children[i].name)) scene.remove(scene.children[i]);
    }
}

export function changeShadowPreset(scene, preset) {
    for(let child of scene.children){
        if(child.type === "DirectionalLight"){
            if(preset == 1){
                child.shadow.mapSize.x = 768;
                child.shadow.mapSize.y = 768;
                child.shadow.map.dispose();
                child.shadow.map = null;
            }
            else if(preset == 2){
                child.shadow.mapSize.x = 2048;
                child.shadow.mapSize.y = 2048;
                child.shadow.map.dispose();
                child.shadow.map = null;
            }
        }
    }
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
    let height = Math.min(building.value, 35); // Cap height
	for(let i = 0; i < height; i++){
		let assetToLoad = "";
		if(i === 0) assetToLoad = building.building.groundUrl; // Load ground tile
		else if(i === height-1) assetToLoad = building.building.roofUrl; // Load roof tile
		else assetToLoad = building.building.floorUrl; // Load floor tile
        if(assetToLoad == null || assetToLoad == "") return;

		loader.load(`./assets/${assetToLoad}`, function (gltf) {
            let isLShaped = building.type === 2;
            let extraShiftZ = 0;
            let extraShiftX = 0;
            if(isLShaped && building.dir === 1){
                extraShiftZ = 2;
                extraShiftX = 2;
            }
            let extraAngle = 0;

            setShadow(gltf.scene, true, false);

            gltf.scene.name = "Building";
            if(building.mirror){
                gltf.scene.scale.z *= -1; // mirror the object
                extraAngle = 270; // add extra angle to compensate shift from mirroring
            }

            gltf.scene.position.y = y + i * FLOOR_HEIGHT * 2;
            gltf.scene.position.x = x + extraShiftX;
            gltf.scene.position.z = z + extraShiftZ;

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
        gltf.scene.position.x = x;
        gltf.scene.position.z = z;
        gltf.scene.rotation.y = THREE.Math.degToRad(-90 * road.dir);

        setShadow(gltf.scene, false, true);

        gltf.scene.name = "Road";
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    } );
}

export function renderGrass(x, y, z, scene){
    let assetToLoad = GRASS_ASSET;

    loader.load(`./assets/${assetToLoad}`, function (gltf) {
        gltf.scene.position.y = y;
        gltf.scene.position.x = x;
        gltf.scene.position.z = z;

        setShadow(gltf.scene, false, true);

        gltf.scene.name = "Grass";
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    } );

    // Create a tree somewhere on the tile
    for(let i of [-0.7, 0.7]){
        loader.load(`./assets/${TREES_SMALL[Math.floor(TREES_SMALL.length * Math.random())]}`, function(gltf) {
            gltf.scene.position.x = x + Math.random() * i;
            gltf.scene.position.y = y;
            gltf.scene.position.z = z + Math.random() * i;

            setShadow(gltf.scene, true, false);

            gltf.scene.name = "Tree";
            scene.add(gltf.scene);
        })
    }
}

// Convert given scene into STL
export function convertSceneToStlBlobUrl(scene) {
    const exporter = new STLExporter();
    const str = exporter.parse(scene);
    const blob = new Blob([str], { type: 'text/plain' });
    return URL.createObjectURL(blob)
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
        powerPreference: "high-performance",
        antialias: true,
        depth: true,
        canvas: document.querySelector("#bg")
    });

    resizeRenderer(renderer);

    renderer.render(scene, camera);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return renderer;
}

// Set's the renderers size to current window size
function resizeRenderer(renderer) {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create and configure controls and return it
function createControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = -1;
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
    const ambientLight = new THREE.AmbientLight(0x9AD0EC, 0.7);
    //const ambientLight = new THREE.AmbientLight(0x9AD0EC, 1);
    scene.add(ambientLight);

    // Directional lighting and shadows
    const directionLight = new THREE.DirectionalLight(0xE9B37C);
    directionLight.position.set(-50, 50, -20);
    directionLight.castShadow = true;
    directionLight.shadow.mapSize.x = 768;
    directionLight.shadow.mapSize.y = 768;
    directionLight.shadow.camera.near = 15;
    directionLight.shadow.camera.far = 150.0;
    directionLight.shadow.camera.right =  75;
    directionLight.shadow.camera.left = -75;
    directionLight.shadow.camera.top =  75;
    directionLight.shadow.camera.bottom = -75;
    scene.add(directionLight);
}

// Create and setup anything environment-related
function setupEnvironment(scene) {
    const sceneBackground = new THREE.Color(0x9AD0EC);
    scene.background = sceneBackground;

    const position = new THREE.Vector3(0, -4, 0);

    // Render environment (ground)
    loader.load(`./assets/${ENVIRONMENT_ASSET}`, function(gltf) {
        const env = gltf.scene;
        env.position.set(...position);
        setShadow(gltf.scene, false, true);
        scene.add(env);
    });

    // Render environment (objects and other stuff)
    loader.load(`./assets/${ENVIRONMENT_OBJECTS_ASSET}`, function(gltf) {
        const env_objects = gltf.scene;
        env_objects.position.set(...position);
        setShadow(gltf.scene, true, false);
        scene.add(env_objects);
    });

    // Render and animate animated environment
    let mixer;
    const updateMixer = (delta) => {
        if(mixer) mixer.update(delta);
    }

    loader.load(`./assets/${ENVIRONMENT_ANIMATED_ASSET}`, function(gltf) {
        const env_animated = gltf.scene;
        env_animated.position.set(...position);
        setShadow(gltf.scene, true, false);

        // Setup animation mixer and play all animations
        mixer = new THREE.AnimationMixer(env_animated);
        const clips = gltf.animations;

        clips.forEach(function (clip) {
            mixer.clipAction(clip).play();
        });

        scene.add(env_animated);
    });

    return updateMixer;
}