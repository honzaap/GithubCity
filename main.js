import { findTiles, getTileTypes, initializeTiles } from "./algo";
import { fetchContributions, getConvertedContributions } from "./api";
import { INIT_CONTRIBUTIONS } from "./constants";
import {
    changeShadowPreset,
    clearScene,
    convertSceneToStlBlobUrl,
    createScene,
    renderBuilding,
    renderGrass,
    renderRoad,
} from "./scene";

// Get HTML elements
const autoRotateButton = document.getElementById("autorotate");
const downloadButton = document.getElementById("download");
const downloadButtonAnchor = document.getElementById("download-a");
const yearSelect = document.getElementById("yearSelect");
const usernameInput = document.getElementById("usernameInput");
const infoForm = document.getElementById("infoForm");
const selectionScreen = document.getElementById("selectionScreen");
const titleLink = document.getElementById("title");
const displayInfo = document.getElementById("displayInfo");
const errorMessage = document.getElementById("errorMessage");
const shadowPreset = document.getElementById("shadowPreset");

// Populate year select with years down to 2008
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 2008; y--) {
    const option = document.createElement("option");
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
if (urlParams.get("name") && urlParams.get("year")) {
    // Generate city with url params
    enteredInfo = true;
    const name = urlParams.get("name");
    const year = urlParams.get("year");
    generateCityFromParams(name, year);
} else {
    // Placeholder city
    generateCity(INIT_CONTRIBUTIONS);
}

/* - - Input events - - */
// Set autorotations
autoRotateButton.onclick = (e) => {
    e.preventDefault();
    controls.autoRotate = !controls.autoRotate;
    if (controls.autoRotate) autoRotateButton.classList.remove("inactive");
    else autoRotateButton.classList.add("inactive");
};

// Submit form, get data and generate city
infoForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = usernameInput.value.trim();
    const year = yearSelect.value;
    enteredInfo = true;
    const tempArray = window.location.href.split("?");
    const baseURL = tempArray[0];
    const newUrl = `${baseURL}?name=${name}&year=${year}`;
    window.history.replaceState("", "", newUrl);
    await generateCityFromParams(name, year);
};

// Open UI back, start autorotation
titleLink.onclick = (e) => {
    e.preventDefault();
    if (!selectionScreen.classList.contains("hidden") && enteredInfo) {
        selectionScreen.classList.add("hidden");
    } else {
        selectionScreen.classList.remove("hidden");
        controls.autoRotate = true;
        errorMessage.style.display = "none";
    }

    if (controls.autoRotate) autoRotateButton.classList.remove("inactive");
    else autoRotateButton.classList.add("inactive");
};

shadowPreset.onchange = () => {
    changeShadowPreset(scene, shadowPreset.value);
};

async function generateCityFromParams(name, year) {
    // Get data from API
    const apiContribs = await fetchContributions(name, year);
    if (apiContribs == null) {
        errorMessage.style.display = "block";
        return;
    }

    // Convert data to 2D array
    const contribs = getConvertedContributions(apiContribs);

    selectionScreen.classList.add("hidden");
    displayInfo.innerHTML = `<span>${name}</span> <span>${year}</span>`;

    // Render data
    generateCity(contribs);

    // Set download
    downloadButton.onclick = (e) => {
        e.preventDefault();
        download(name, year, scene);
    };
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
    for (let i = 0; i < tileTypes.length; i++) {
        for (let j = 0; j < tileTypes[0].length; j++) {
            const tileType = tileTypes[i][j];
            const x = 2 * (j + renderShiftX) * 1.1;
            const z = 2 * (i + renderShiftY) * 1.1;
            if (tileType.tile === 0) {
                // Render grass tiles
                renderGrass(x, 0, z, scene);
            } else if (tileType.tile === 1) {
                // Render road tiles
                renderRoad(x, -0.015, z, tileTypes[i][j], scene);
            } else if (tileType.tile === 2) {
                // Render building tiles
                renderBuilding(x, 2 * renderShiftZ, z, tileTypes[i][j], scene);
            }
        }
    }
}

function download(name, year, scene) {
    const blobUrl = convertSceneToStlBlobUrl(scene);
    downloadButtonAnchor.href = blobUrl;
    downloadButtonAnchor.download = `${name}-${year}-city.stl`;
    downloadButtonAnchor.click();
}
