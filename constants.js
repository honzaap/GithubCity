/**
 * Constants for the app
 */

export const BUILDING_TYPES = {
    0: [
        {
            groundUrl: "building_1x1_0_g.glb",
            floorUrl: "building_1x1_0_f.glb",
            roofUrl: "building_1x1_0_r.glb",
            min: 4,
            max: 999
        },
        {
            groundUrl: "building_1x1_1_g.glb",
            min: 1,
            max: 1
        },
        {
            groundUrl: "building_1x1_2_g.glb",
            roofUrl: "building_1x1_2_r.glb",
            min: 2,
            max: 2
        },
        {
            groundUrl: "building_1x1_3_g.glb",
            floorUrl: "building_1x1_3_f.glb",
            roofUrl: "building_1x1_3_r.glb",
            min: 2,
            max: 5
        },
        {
            groundUrl: "building_1x1_4_g.glb",
            min: 1,
            max: 1
        },
        {
            groundUrl: "building_1x1_5_g.glb",
            floorUrl: "building_1x1_5_f.glb",
            roofUrl: "building_1x1_5_r.glb",
            min: 2,
            max: 6  
        },
        {
            groundUrl: "building_1x1_6_g.glb",
            floorUrl: "building_1x1_6_f.glb",
            roofUrl: "building_1x1_6_r.glb",
            min: 6,
            max: 999  
        },
        {
            groundUrl: "building_1x1_7_g.glb",
            floorUrl: "building_1x1_7_f.glb",
            roofUrl: "building_1x1_7_r.glb",
            min: 4,
            max: 999  
        },
        {
            groundUrl: "building_1x1_8_g.glb",
            floorUrl: "building_1x1_8_f.glb",
            roofUrl: "building_1x1_8_r.glb",
            min: 5,
            max: 999  
        },
        {
            groundUrl: "building_1x1_9_g.glb",
            floorUrl: "building_1x1_9_f.glb",
            roofUrl: "building_1x1_9_r.glb",
            min: 5,
            max: 999  
        },
        {
            groundUrl: "building_1x1_10_g.glb",
            floorUrl: "building_1x1_10_f.glb",
            roofUrl: "building_1x1_10_r.glb",
            min: 4,
            max: 999  
        },
        {
            groundUrl: "building_1x1_11_g.glb",
            floorUrl: "building_1x1_11_f.glb",
            roofUrl: "building_1x1_11_r.glb",
            min: 5,
            max: 999  
        },
        {
            groundUrl: "building_1x1_12_g.glb",
            floorUrl: "building_1x1_12_f.glb",
            roofUrl: "building_1x1_12_r.glb",
            min: 4,
            max: 999  
        }
        
    ],
    1: [
        {
            groundUrl: "building_1x2_0_g.glb",
            min: 1,
            max: 1  
        },
        {
            groundUrl: "building_1x2_1_g.glb",
            roofUrl: "building_1x2_1_r.glb",
            min: 2,
            max: 2  
        },
        {
            groundUrl: "building_1x2_2_g.glb",
            floorUrl: "building_1x2_2_f.glb",
            roofUrl: "building_1x2_2_r.glb",
            min: 2,
            max: 6  
        },
        {
            groundUrl: "building_1x2_3_g.glb",
            roofUrl: "building_1x2_3_r.glb",
            min: 2,
            max: 2  
        },
        {
            groundUrl: "building_1x2_4_g.glb",
            floorUrl: "building_1x2_4_f.glb",
            roofUrl: "building_1x2_4_r.glb",
            min: 4,
            max: 999  
        },
        {
            groundUrl: "building_1x2_5_g.glb",
            floorUrl: "building_1x2_5_f.glb",
            roofUrl: "building_1x2_5_r.glb",
            min: 5,
            max: 8  
        },
        {
            groundUrl: "building_1x2_6_g.glb",
            floorUrl: "building_1x2_6_f.glb",
            roofUrl: "building_1x2_6_r.glb",
            min: 3,
            max: 999  
        },
        {
            groundUrl: "building_1x2_7_g.glb",
            floorUrl: "building_1x2_7_f.glb",
            roofUrl: "building_1x2_7_r.glb",
            min: 4,
            max: 8  
        },
        {
            groundUrl: "building_1x2_8_g.glb",
            floorUrl: "building_1x2_8_f.glb",
            roofUrl: "building_1x2_8_r.glb",
            min: 5,
            max: 999  
        },
        {
            groundUrl: "building_1x2_9_g.glb",
            floorUrl: "building_1x2_9_f.glb",
            roofUrl: "building_1x2_9_r.glb",
            min: 5,
            max: 999  
        }
    ],
    2: [
        {
            groundUrl: "placeholder20.glb",
            floorUrl: "placeholder21.glb",
            roofUrl: "placeholder22.glb",
            min: 1,
            max: 999
        }
    ]
};

export const FLOOR_HEIGHT = 0.8;

export const ROAD_TYPES = {
    0: "road0.glb",
    1: "road1.glb",
    2: "road2.glb",
    3: "road3.glb"
}

export const TREES_SMALL = ["tree_small_0.glb", "tree_small_1.glb", "tree_small_2.glb"];

export const GRASS_ASSET = "grass.glb";

export const ENVIRONMENT_ASSET = "environment.glb";

export const ENVIRONMENT_OBJECTS_ASSET = "environment_objects.glb";

export const ENVIRONMENT_ANIMATED_ASSET = "environment_animated.glb";

export const AWS_API_URL = "https://uvdvlzzjiciqsfkl7u37nnhnsm0sleur.lambda-url.eu-central-1.on.aws";

export const INIT_CONTRIBUTIONS = [[1,1,0,0,2,2,2,3,1,2,2,0,2,0,0,2,2,2,0,0,0,1,0,3,1,1,2,0,1,2,1,2,0,1,2,2,1,1,0,1,1,1,2,1,0,2,2,0,2,0,1,2,0],[2,2,2,1,2,0,1,0,2,3,3,2,0,1,0,2,2,2,0,2,1,1,2,2,3,1,0,1,1,2,2,1,2,2,1,3,2,2,0,2,1,1,2,2,2,0,1,1,2,1,0,1,0],[1,2,2,3,2,1,1,0,1,0,2,2,3,1,1,1,1,0,0,0,0,3,1,0,3,1,1,1,1,1,1,2,0,2,2,2,0,0,4,2,0,1,2,2,0,2,2,1,2,0,1,1,2],[2,2,0,1,2,1,2,1,1,2,4,1,1,0,0,0,1,1,2,2,1,1,2,3,3,0,0,2,2,4,4,1,0,0,1,2,2,0,0,0,0,3,1,0,0,0,2,2,2,1,2,4,2],[2,0,2,2,0,1,0,1,1,2,2,1,0,2,1,1,2,2,0,1,1,0,2,0,2,2,2,0,1,0,0,0,2,0,1,1,2,1,1,0,0,0,1,0,0,0,2,1,0,1,2,2,2],[0,1,2,0,0,2,2,1,2,1,3,0,0,1,2,4,0,0,1,1,1,0,0,2,2,2,2,0,1,2,0,0,1,0,2,2,0,0,1,1,1,1,2,2,0,0,0,1,2,3,1,2,1],[0,0,0,3,3,0,0,0,0,2,0,1,2,2,1,2,1,2,2,2,1,0,2,0,1,0,0,2,1,1,2,0,2,0,0,0,1,0,4,4,2,2,0,2,0,0,1,1,0,2,1,2,1]]
