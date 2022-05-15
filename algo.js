import { CONTRIBS, BUILDING_TYPES } from "./constants";

const rowLength = 53;
const colLength = 7;

const tileTypes = [];
const seenTiles = [];

export function initializeTiles() {
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
}

export function getTileTypes() {
    return tileTypes;
}

export function getSeenTiles() {
    return seenTiles();
}

/// Determine if given coordinates are within bounds
function isInBounds(x, y) {
	return x >= 0 && x < rowLength && y >= 0 && y < colLength;
}

// Determine if the given path (format "x|y") is valid: there cant be a 2x2 square in the path
function isRoadPathValid(path) {
	for(let p of path) {
		let coords = p.split("|");
		if(path.has(`${parseInt(coords[0])+1}|${parseInt(coords[1])}`) && path.has(`${parseInt(coords[0])}|${parseInt(coords[1])+1}`) && path.has(`${parseInt(coords[0])+1}|${parseInt(coords[1])+1}`)){
			return false;
		}
	}
	return true;
}

/*
	x: x coordinate
	y: y coordinate
	dir: direction on the 2D field TO (not from) which the function was called
		0: to top
		1: to right
		2: to bottom
		3: to left
		-1: unset
	prevDir: direction TO which the function was called 1 cycle back
	path: list of visited coordinates
	ttl: time to live
	ignoreSeen: whether to ignore if tile was already seen
*/
function findRoad(x, y, dir, prevDir, path, ttl, ignoreSeen = false) {
	if(!isInBounds(x, y) || (seenTiles[y][x] === 1 && !ignoreSeen) || CONTRIBS[y][x] !== 0 || path.has(`${x}|${y}`)){ 
		return {road: [], path:path};
	}

	seenTiles[y][x] = 1;
	if(ttl <= 0 && ignoreSeen){
		return {road: [], path:path};
	}
	ttl--;

	path.add(`${x}|${y}`);
	let roadUp = {road:[], path: new Set()};
	let roadDown = {road:[], path: new Set()};
	let roadRight = {road:[], path: new Set()};
	let roadLeft = {road:[], path: new Set()};
	let goesUp = dir === 2;
	let goesRight = dir === 3;
	let goesDown = dir === 0;
	let goesLeft = dir === 1;
	let roadDir = 0;
	let roadType = -2 + (dir === -1 ? 0 : 1);
	let allRoads = [];
	let sortedRoads = [];

	if(dir !== 2 && !(prevDir === 2 && (dir === 1 || dir === 3))){ // Can I go Up?
		roadUp = findRoad(x, y-1, 0, dir, new Set([...path]), ttl, ttl>0);
		sortedRoads.push(roadUp);
	}
	if(dir !== 3 && !(prevDir === 3 && (dir === 0 || dir === 2))){ // Can I go Right?
		roadRight = findRoad(x+1, y, 1, dir, new Set([...path]), ttl, ttl>0);
		sortedRoads.push(roadRight);
	}
	if(dir !== 0 && !(prevDir === 0 && (dir === 1 || dir === 3))){ // Can I go Bottom?
		roadDown = findRoad(x, y+1, 2, dir, new Set([...path]), ttl, ttl>0);
		sortedRoads.push(roadDown);
	}
	if(dir !== 1 && !(prevDir === 1 && (dir === 0 || dir === 2))){ // Can I go Left?
		roadLeft = findRoad(x-1, y, 3, dir, new Set([...path]), ttl, ttl>0);
		sortedRoads.push(roadLeft);
	}
	// Add roads from all possible direction sorted by the longest
	sortedRoads.sort((r1, r2) => r2.road.length-r1.road.length);
	for(let i = 0; i < sortedRoads.length; i++){
		if(allRoads.length < 0 || sortedRoads[i].road.length > 0 && isRoadPathValid(new Set([...path, ...sortedRoads[i].path]))){
			goesUp = goesUp || sortedRoads[i] === roadUp;
			goesDown = goesDown || sortedRoads[i] === roadDown;
			goesRight = goesRight || sortedRoads[i] === roadRight;
			goesLeft = goesLeft || sortedRoads[i] === roadLeft;
			roadType += 1;
			allRoads = [...allRoads, ...sortedRoads[i].road];
			path = new Set([...path, ...sortedRoads[i].path]);
		}
	}

	roadType = Math.max(roadType, 0);

	if(roadType === 0){ // Straight road
		roadDir = 1;
		if(goesUp || goesDown) roadDir = 0;
	}
	else if(roadType === 1){ // 3 way road
		if(!goesUp) roadDir = 3;
		else if(!goesRight) roadDir = 0;
		else if(!goesDown) roadDir = 1;
		else if(!goesLeft) roadDir = 2;
	}
	if(roadType === 0 && (goesDown && (goesRight || goesLeft) || goesUp && (goesRight || goesLeft))){ // 2 way turn
		roadType = 3
		if(goesUp && goesLeft) roadDir = 0;
		else if(goesUp && goesRight) roadDir = 1;
		else if(goesDown && goesLeft) roadDir = 3;
		else if(goesDown && goesRight) roadDir = 2;
	}
	return {road:[{x:x,y:y,type:roadType,dir:roadDir}, ...allRoads],path:path};
}

function findBuilding(x, y, val) {
	//{x: x,y: y,type: 1, building: 1, dir: roadDir}
    let res = {x, y, type: -1, building: {}, dir: -1};
	let neighborCoords = [];
	seenTiles[y][x] = 1;

	for(let i of [-1,1]){
		if(isInBounds(x, y+i) && CONTRIBS[y+i][x] === val && seenTiles[y+i][x] === 0){
			neighborCoords.push({x, y: y+i, dir: 1+i})
		}
		if(isInBounds(x-i, y) && CONTRIBS[y][x-i] === val && seenTiles[y][x-i] === 0){
			neighborCoords.push({x: x-i, y, dir: 2+i})
		}
	}

	if(neighborCoords.length >= 1){ 
		res.dir = 0;
		let found = false;
		// Search corner neighbour tiles
		for(let j of [1,-1]){
			for(let i of [j*-1,j]){
				if(!isInBounds(x+j, y+i) || CONTRIBS[y+i][x+j] !== val || seenTiles[y+i][x+j] === 1) {
                    res.dir++;
                    continue;
                };
				//Search for L pattern leading to found corner tile
				for(let k = 2; k >= 1; k--){
					let center = {x: x + (j * (-1 + k)), y: y + (i * (2 - k))};
					if(CONTRIBS[center.y][center.x] === val && seenTiles[center.y][center.x] === 0){
						res.type = 2; // L type
						seenTiles[center.y][center.x] = 1;
						seenTiles[y+i][x+j] = 1;
						res.mirror = k === 2;
						found=true;
						break;
					}
				}
			}
			if(found) break;
            else res.dir++;
		}
		if(res.type === -1){ // Search for 1x2 pattern
			res.type = 1; // 1x2 type
			let coords = neighborCoords[0];
			seenTiles[coords.y][coords.x] = 1;
			res.dir = coords.dir;
		}
	}
	else{
		res.type = 0; // 1x1 type
		res.dir = Math.floor(Math.random()*4);
	}

	if(res.type !== -1){ // pick a building model on random depending on type
		res.building = BUILDING_TYPES[res.type][0*Math.floor(Math.random()*BUILDING_TYPES[res.type].length)];
	}

	return res;
}

// Start the algorithm - find and set all tile types
export function findTiles(){
    let roads = [];
    for(let y = 0; y < CONTRIBS.length; y++){
        for(let x = 0; x < CONTRIBS[y].length; x++){
    
            // Find roads (value = 0 and tile wasn't seen yet)
            if(CONTRIBS[y][x] === 0 && seenTiles[y][x] === 0){
                let road = findRoad(x, y, -1, -1, new Set(), 15, false);
                roads = roads.concat(road.road);
            }
    
            // Find grass (value = 0 and tile was seen but not set to road)
            if(CONTRIBS[y][x] === 0 && seenTiles[y][x] === 1 && tileTypes[y][x] !== 1){
                tileTypes[y][x] = {tile:0};
            }
    
            // Find building (value > 0 and tile wasnt seen yet)
            if(CONTRIBS[y][x] > 0 && seenTiles[y][x] === 0){
                let building = findBuilding(x, y, CONTRIBS[y][x]);
                tileTypes[y][x] = {tile: 2, type: building.type, building: building.building, dir: building.dir, value: CONTRIBS[y][x], mirror: building.mirror};
                //for(let tile of building.tiles){
                //    tileTypes[tile.y][tile.x] = {tile: 2, type: building.type, building: building.building, dir: building.dir, value: CONTRIBS[y][x]};
                //}
            }
        }
    }
    
    // Add found roads to all tile types
    for(let road of roads){
        tileTypes[road.y][road.x] = {tile:1, type:road.type,dir:road.dir};
    }
}