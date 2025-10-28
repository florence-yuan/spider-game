import { Building } from "./setting/Building";
import { SpiderEngine } from "./characters/SpiderEngine";
import { GuestEngine } from "./characters/GuestEngine";

export class GameEngine {
    constructor(
        bgCtx, brickCtx, charCtx, spiderCtx,
        canvasWidth, canvasHeight, numFloors
    ) {
        this.bgCtx = bgCtx;
        this.brickCtx = brickCtx;
        this.charCtx = charCtx;
        this.spiderCtx = spiderCtx;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.numFloors = numFloors;

        this.curFloor = numFloors - 1;

        this.viewShift = 0;

        this.sceneID = 1;

        this.removeBricks = this.removeBricks.bind(this);
        this.hasBricks = this.hasBricks.bind(this);
        this.shiftView = this.shiftView.bind(this);
        this.intersectsSpider = this.intersectsSpider.bind(this);
        this.resetScene = this.resetScene.bind(this);
        this.nextScene = this.nextScene.bind(this);
    }

    paintGame() {
        this.building = new Building(
			this.bgCtx,
            this.brickCtx,
			this.canvasWidth,
			this.canvasHeight,
			this.numFloors
		);
        this.building.paintBuilding();

        this.guests = new GuestEngine(
            this.charCtx,
            this.canvasWidth,
			this.canvasHeight,
            this.numFloors,
            this.building.floorBounds,
            this.hasBricks,
            this.intersectsSpider,
            this.resetScene
        );
        this.guests.paintGuests();

        this.spider = new SpiderEngine(
            this.spiderCtx,
            this.canvasWidth,
			this.canvasHeight,
            this.numFloors - 1,
            this.building.floorBounds[this.numFloors - 1],
            this.removeBricks,
            this.hasBricks,
            this.shiftView,
            this.nextScene
        );
        this.spider.initPaintSpider();
    }

    startGame() {
        // this.guests.startGuests();
        this.spider.startSpider();
        this.building.startPlatformMotion();

        // this.spider.paintSpider();
        console.log('view shift', this.viewShift)
    }

    getSpider() {
        return this.spider;
    }

    getFloorBounds(floor) {
        return this.building.floorBounds[floor];
    }

    removeBricks(floorID, start, end, remove) {
        return this.building.removeBricks(floorID, start, end, remove);
    }

    hasBricks(floorID, start, end) {
        return this.building.hasBricks(floorID, start, end);
    }

    shiftView(shiftMargin) {
        this.viewShift += shiftMargin;
        document.querySelector(".game-view").style.transform = `translateX(-50%) translateY(${this.viewShift}px)`;
    }

    shiftViewToBottom() {
        this.viewShift = 0;
    }

    intersectsSpider(props) {
        return !this.spider.isImmune && this.spider.intersectsWith(...props);
    }

    // Handles Game Over
    resetGame(type = 'lives-up') {
        console.log('GAME OVER');
        this.guests.isActive = false;
        this.guests.setGuestBounds();
        this.spider.resetSpider();
        this.handleMsg.gameOver(type);
    }

    // Handles scenario where spider dies
    resetScene() {
        if (this.spider.numLives <= 1) {
            this.resetGame();
        } else {
            this.handleMsg.sceneTrans();
            this.spider.isActive = false;
            this.spider.handleNewLife();
            setTimeout(() => {
                this.shiftView(-this.viewShift);
                setTimeout(() => {
                    this.guests.startMotion();
                }, 2500);
            }, 4500);
        }
    }

    // Go through to next scene
    nextScene() {
        this.sceneID++;
        this.guests.isActive = false;
        // this.spider.resetSpider();
        this.handleMsg.sceneTrans('next-scene');
    }
}