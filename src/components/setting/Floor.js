import { windowImg } from "./Building";

const BRICK_WIDTH = 30;
const BRICK_HEIGHT = 15;
const WINDOW_GAP = 50, LEFT_GAP = 50;
const LINE_WIDTH = 1.5;

const BRICK_COLOR = [
    { fill: "#f9ae79", stroke: "#55240b" },
    { fill: "white", stroke: "#bebebe" },
]

export class Floor {
    constructor(ctx, brickCtx, canvasWidth, floorInd, bounds, styles) {
        this.context = ctx;
        this.brickContext = brickCtx;
        this.floorInd = floorInd;
        this.canvasWidth = canvasWidth;
        this.bounds = bounds;
        this.styles = styles;
        this.numBricks = Math.floor(this.bounds[2] / BRICK_WIDTH);
    }

    setBrickBounds(brickPattern) {
        this.brickBounds = [];
        for (let i = 0; i < this.numBricks; i++) {
            this.brickBounds.push([
                this.bounds[0] + i * BRICK_WIDTH,
                this.bounds[1] + this.bounds[3],
                true,
                brickPattern
            ]);
        }
    }

    paintBrick(x, y, width, height, deviation = 0, brickType = 0) {
        const ctx = this.brickContext;
        // ctx.fillStyle = "#422341";
        ctx.fillStyle = BRICK_COLOR[brickType].fill;
        ctx.strokeStyle = BRICK_COLOR[brickType].stroke;
        ctx.lineWidth = LINE_WIDTH;
        ctx.fillRect(x + deviation, y, width, height);
        ctx.strokeRect(x + deviation + LINE_WIDTH / 2, y + LINE_WIDTH / 2, width - LINE_WIDTH, height - LINE_WIDTH);
    }

    paintFloor(hasFloor = true, deviation = 0, brickPattern = 0, clearBricks = false) {
        const ctx = this.context;

        if (clearBricks) {
            this.brickContext.clearRect(0, this.brickBounds[0][1] - 1, this.canvasWidth, BRICK_HEIGHT + 1);
        }
        if (hasFloor) {
            ctx.fillStyle = this.styles.bgColor;
            ctx.fillRect(...this.bounds);
    
            const [startx, width, height] = this.styles.bgImgBounds;
            const windowStartTop = this.bounds[1] + (this.bounds[3] - height) / 2;
            const numWindows = Math.floor(this.bounds[2] / (width + WINDOW_GAP));
            for (let i = 0; i < numWindows; i++) {
                ctx.drawImage(
                    windowImg,
                    startx,
                    0,
                    width,
                    height,
                    this.bounds[0] + LEFT_GAP + i * (width + WINDOW_GAP),
                    windowStartTop,
                    width,
                    height
                );
            }
        }
            
        //     const windowStartTop = this.bounds[1] + (this.bounds[3] - img.naturalHeight) / 2;
        //     const numWindows = Math.floor(this.bounds[2] / (img.naturalWidth + WINDOW_GAP));
    
        //     img.addEventListener("load", () => {
        //         for (let i = 0; i < numWindows; i++) {
        //             ctx.drawImage(img, this.bounds[0] + LEFT_GAP + i * (img.naturalWidth + WINDOW_GAP), windowStartTop);
        //         }
        //     });
        // }

        if (!clearBricks) {
            this.setBrickBounds(brickPattern);
        }

        for (let i = 0; i < this.numBricks; i++) {
            if (this.brickBounds[i][2]) {
                this.paintBrick(
                    this.brickBounds[i][0],
                    this.brickBounds[i][1],
                    BRICK_WIDTH,
                    BRICK_HEIGHT,
                    deviation,
                    brickPattern
                );
            }
        }
    }
}