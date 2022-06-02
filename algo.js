import { CONTRIBS, BUILDING_TYPES } from "./constants";

let rowLength = 53;
let colLength = 7;

const tileTypes = [];
const seenTiles = [];

// Look through contributions and assign tileType and seenTile to all positions
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

// Get contributions value for given coordinates
function getValue(x, y){
	return isInBounds(x, y) ? CONTRIBS[y][x] : -1;
}

// Get tile type for given coordinate
function getType(x ,y){
	return isInBounds(x, y) ? tileTypes[y][x] : {}; 
}

// Tell whether the tile at given coordinates was seen 
function getSeen(x, y){
	return isInBounds(x, y) ? seenTiles[y][x] : -1;
}

/// Determine if given coordinates are within bounds
function isInBounds(x, y) {
	return x >= 0 && x < rowLength && y >= 0 && y < colLength;
}

// Determine whether a 2x2 square is formed in any direction from given coordinates
function is2x2Square(x, y){
	for(let i of [-1, 1]){
		for(let j of [-1, 1]){
			if(getValue(x, y+i) === 0 && getType(x, y+i).tile !== 0
			&& getValue(x+j, y+i) === 0 && getType(x+j, y+i).tile !== 0
			&& getValue(x+j, y) === 0 && getType(x+j, y).tile !== 0){
				return true;
			}
		}
	}
	return false;
}

// Returns road type with its direction for given coordinates
function findRoad(x, y) {
	if(getValue(x, y) !== 0 || getType(x, y).tile === 0){ 
		return {x, y};
	}

	let goesUp 		= getValue(x, y-1) === 0 && getType(x, y-1).tile !== 0;
	let goesRight 	= getValue(x+1, y) === 0 && getType(x+1, y).tile !== 0;
	let goesDown 	= getValue(x, y+1) === 0 && getType(x, y+1).tile !== 0;
	let goesLeft 	= getValue(x-1, y) === 0 && getType(x-1, y).tile !== 0;

	let roadDir = 0;
	let roadType = Math.max([goesUp, goesRight, goesDown, goesLeft].filter(r => r).length - 2, 0);

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
	return {x, y, type: roadType, dir: roadDir};
}

// Returns the type, direction and model for the building on given coordinates
function findBuilding(x, y, val) {
    let res = {x, y, type: -1, building: {}, dir: -1};
	let neighborCoords = [];
	seenTiles[y][x] = 1;

	for(let i of [-1,1]){
		if(getValue(x, y+i) === val && getSeen(x, y+i) === 0){
			neighborCoords.push({x, y: y+i, dir: 1+i})
		}
		if(getValue(x-i, y) === val && getSeen(x-i, y) === 0){
			neighborCoords.push({x: x-i, y, dir: 2+i})
		}
	}

	if(neighborCoords.length >= 1){ 
		res.dir = 0;
		let found = false;
		// Search corner neighbour tiles
		for(let j of [1,-1]){
			for(let i of [j*-1,j]){
				if(getValue(x+j, y+i) !== val || getSeen(x+j, y+i) === 1) {
                    res.dir++;
                    continue;
                };
				//Search for L pattern leading to found corner tile
				for(let k = 2; k >= 1; k--){
					let center = {x: x + (j * (-1 + k)), y: y + (i * (2 - k))};
					if(getValue(center.x, center.y) === val && getSeen(center.x, center.y) === 0){
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
		let types = BUILDING_TYPES[res.type];
		types = types.filter(t => val >= t.min && val <= t.max);
		res.building = types[Math.floor(Math.random() * types.length)];
	}

	return res;
}

// Start the algorithm - find and set all tile types
export function findTiles(){
	// Remove any 2x2 squares by replacing tiles with grass
	for(let y = 1; y < CONTRIBS.length; y+=2){
		for(let x = 1; x < CONTRIBS[y].length; x++){
			if(getValue(x, y) === 0 && is2x2Square(x, y)){
				tileTypes[y][x] = { tile: 0 };
				x++;
			}
		}
	}

    for(let y = 0; y < CONTRIBS.length; y++){
        for(let x = 0; x < CONTRIBS[y].length; x++){
            // Find roads
			if(getValue(x, y) === 0 && getType(x, y).tile !== 0){
				let road = findRoad(x, y);
				tileTypes[road.y][road.x] = { tile: 1, type: road.type, dir: road.dir };
			}
    
            // Find grass
            if(getValue(x, y) === 0 && getSeen(x, y) === 1 && getType(x, y) !== 1){
                tileTypes[y][x] = {tile:0};
            }
    
            // Find building
            if(getValue(x, y) > 0 && getSeen(x, y) === 0){
                let building = findBuilding(x, y, getValue(x, y));
                tileTypes[y][x] = {tile: 2, type: building.type, building: building.building, dir: building.dir, value: getValue(x, y), mirror: building.mirror};
            }
        }
    }
}