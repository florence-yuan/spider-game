import { Floor } from "./Floor";
import { FloorEngine } from "../FloorEngine";
import { Platform } from "./Platform";

const FLOOR_HEIGHT = 150;
const BRICK_WIDTH = 30;
const BRICK_HEIGHT = 15;

const bgColors = [
    '#70a7a5',
    '#397a79',
    '#639291',
    '#4a9c9b'
];

export const windowImg = new Image();
windowImg.src = process.env.PUBLIC_URL + "/images/window_sprite.png";

const windowBounds = [
    [0, 62, 84],
    [62, 46, 110],
    [108, 60, 87]
]

const noiseImg = new Image();
noiseImg.src = "/images/noise.png";

const windowImgs = [];
for (let i = 0; i < 3; i++) {
    const img = new Image();
    img.src = "/images/window" + i + ".png";
    windowImgs.push(img);
}

export class Building extends FloorEngine {
    constructor(ctx, brickCtx, canvasWidth, canvasHeight, numFloors) {
        super();
        this.context = ctx;
        this.brickContext = brickCtx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.numFloors = numFloors;

        this.floorBounds = [];

        if (localStorage.getItem("floorBounds")) {
            this.floorBounds = JSON.parse(localStorage.getItem("floorBounds"));
        } else {
            const totDev = 0;
            for (let i = 0; i < this.numFloors; i++) {
                const deviation = Math.floor(Math.random() * 100) - 50 - totDev;
                this.floorBounds.push([
                    this.getFloorStartWidth(i, deviation),
                    this.getFloorStartHeight(i),
                    this.getFloorWidth(i),
                    FLOOR_HEIGHT
                ]);
            }
    
            localStorage.setItem("floorBounds", JSON.stringify(this.floorBounds));
        }
            
        this.floorStyles = [];
        for (let i = 0; i < this.numFloors; i++) {
            this.floorStyles.push({
                bgColor: bgColors[i % bgColors.length],
                bgImgBounds: windowBounds[i % windowBounds.length]
            });
        }
    }

    lowerBound(arr, pos) {
        let low = 0, high = arr.length - 1;
        let firstInd = -1;
        while (low <= high) {
            let mid = (low + high) / 2;
            if (arr[mid] >= pos) {
                firstInd = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return firstInd;
    }

    removeBricks(floorID, start, end, remove = true) {
        if (floorID < -1)
            return 0;

        const floorBricks = floorID < 0 ? this.platform.brickBounds : this.floors[floorID].brickBounds;
        const deviation = floorID < 0 ? this.platform.curDev : 0;
        let startInd = -1, endInd = -1;
        let overlapWidth = 0;
        for (let i = 0; i < floorBricks.length; i++) {
            if (startInd < 0 && floorBricks[i][0] + deviation >= start) {
                startInd = Math.max(0, i - 1);
                if (i > 0 && floorBricks[i - 1][2]) {
                    overlapWidth += floorBricks[i][0] + deviation - start;
                    if (remove) floorBricks[i - 1][2] = false;
                }
            }
            if (i === floorBricks.length - 1 || floorBricks[i + 1][0] + deviation >= end) {
                endInd = i;
            }
            if (startInd >= 0 && i >= startInd) {
                if (floorBricks[i][2]) {
                    overlapWidth += (i === endInd ? end - floorBricks[i][0] - deviation : BRICK_WIDTH);
                    if (remove) floorBricks[i][2] = false;
                }
            }
            if (endInd > -1)
                break;
        }

        if (startInd < 0 || endInd < 0) {
            return 0;
        }

        if (remove) {
            this.brickContext.clearRect(
                floorBricks[startInd][0] + deviation,
                floorBricks[startInd][1] - 1,
                floorBricks[endInd][0] + BRICK_WIDTH - floorBricks[startInd][0],
                floorBricks[endInd][1] + BRICK_HEIGHT - floorBricks[startInd][1] + 1,
            );
        }

        return overlapWidth;
    }

    hasBricks(floorID, start, end) {
        const overlapWidth = this.removeBricks(floorID, start, end, false);
        return overlapWidth >= (end - start) / 2;
    }

    paintFloors() {
        this.floors = [];
        for (let i = 0; i < this.numFloors; i++) {
            const floor = new Floor(
                this.context,
                this.brickContext,
                this.canvasWidth,
                i,
                this.floorBounds[i],
                this.floorStyles[i],
            );
            floor.paintFloor();
            this.floors.push(floor);
        }
    }

    paintBuilding() {
        const ctx = this.context;
/*         ctx.fillStyle = "#3a1b29";
        ctx.beginPath();
        ctx.arc(this.canvasWidth / 2, this.canvasHeight + 2100, 2500, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath(); */

        this.platformBounds = [
            this.getFloorStartWidth(-1, 0),
            this.getFloorStartHeight(-1),
            this.getFloorWidth(-1),
            FLOOR_HEIGHT
        ];
        
        this.platform = new Platform(
            ctx,
            this.brickContext,
            this.canvasWidth,
            -1,
            this.platformBounds,
            [],
        );
        this.platform.paintPlatform();

        if (windowImg.complete) {
            this.paintFloors();
        } else {
            windowImg.addEventListener("load", () => {
                this.paintFloors();
            });
        }
    }
}