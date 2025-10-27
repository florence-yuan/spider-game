import { FloorEngine } from "../FloorEngine";

const SPIDER_WIDTH = 100;
const SPIDER_HEIGHT = 50;
const FLOOR_HEIGHT = 150;
const JUMP_DUR = 5;
const BRICK_HEIGHT = 15;

const SPEED = {
    HOR_WALK: 8,
    VER_JUMP: (FLOOR_HEIGHT - SPIDER_HEIGHT) / JUMP_DUR * 2,
    FREEZE_TIME: 1000,
    DIE_TIME: 5500,
    SCENE_TIME: 1500,
    DESCEND_TIME: 3000,
    DESCEND_SPEED: 600 / 3000
};

const STATE = {
    NORMAL: 0,
    DEAD: 1
};

const VIEW = {
    TOP: 0,
    BOTTOM: 9
}

const MARGINX = 10;
const MARGINY = 10;

const spiderSprite = new Image();
spiderSprite.src = process.env.PUBLIC_URL + '/images/spider_sprite.png';

const SPRITE_LEN = 4;

const SOUND_SRC = {
    JUMP: process.env.PUBLIC_URL + '/sounds/jump.wav',
    BREAK_BRICK: process.env.PUBLIC_URL + '/sounds/break_brick.wav',
    ONE_UP: process.env.PUBLIC_URL + '/sounds/1-up.wav'
};

const SOUNDS = {};
for (let [sound, src] of Object.entries(SOUND_SRC)) {
    SOUNDS[sound] = new Audio();
    SOUNDS[sound].src = src;
}

export class SpiderEngine extends FloorEngine {
    constructor(ctx, canvasWidth, canvasHeight, startFloor, removeBricks, hasBricks, shiftView, nextScene) {
        super();
        this.context = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.curFloor = startFloor;
        this.removeBricks = removeBricks;
        this.hasBricks = hasBricks;
        this.shiftView = shiftView;
        this.nextScene = nextScene;

        [this.posX, this.posY] = this.getSpiderPos(startFloor, 3);
        this.imgInd = 0;
        this.jumpDir = 0;
        this.jumpSlant = 0;
        this.prevJumpEnd = -1;
        this.prevShouldFall = true;

        this.numLives = 3;
        this.isActive = true;
        this.hasSilk = false;
        this.isImmune = false;

        this.spiderGameLoop = this.spiderGameLoop.bind(this);
        this.intersectsWith = this.intersectsWith.bind(this);
        this.resetSpider = this.resetSpider.bind(this);
        // this.spiderDescend = this.spiderDescend.bind(this);
        this.spiderLoseLife = this.spiderLoseLife.bind(this);

        // this.startSpider();
    }

    #keyPresses = [];

    spiderGameLoop(timeStamp) {
        if (!this.isActive) {
            return;
        }

        if (timeStamp - this.prevTimeStamp2 > 100) {
            this.prevTimeStamp2 = timeStamp;

            if (this.hasSilk) {
                if (this.#keyPresses.k) {
                    this.jumpDir = 1;
                    this.hasSilk = false;
                    SOUNDS.JUMP.play();
                    if (this.threadThin) {
                        clearInterval(this.threadThin);
                        this.threadThin = null;
                        this.isImmune = false;
                    }
                }
            } else if (this.curFloor >= -1 && !this.hasBricks(this.curFloor, this.posX, this.posX + SPIDER_WIDTH)) {
                if (this.jumpDir === 0 && this.prevShouldFall) {
                    this.jumpDir = 1;
                    if (this.#keyPresses.a) {
                        this.jumpSlant = -1;
                    } else if (this.#keyPresses.d) {
                        this.jumpSlant = 1;
                    }
                    if (this.curFloor >= 9) {
                        console.log("GAME END!");
                        return;
                    }
                    this.curFloor++;
                    if (this.curFloor < VIEW.BOTTOM && this.curFloor > VIEW.TOP) {
                        this.shiftView(-FLOOR_HEIGHT);
                    }
                }
                this.prevShouldFall = true;
            } else {
                this.prevShouldFall = false;
                if (this.curFloor < 0 && this.jumpDir === 0) {
                    this.isActive = false;
                    console.log("WINS!!!");
                    setTimeout(() => {
                        this.nextScene();
                    }, 2000);
                    return;
                }
            }
        }
        if (timeStamp - this.prevTimeStamp >= 6000 / 96) {
            this.prevTimeStamp = timeStamp;

            if (this.hasSilk) {
                // TODO: Manage silk coordination
            } else {
                const jumpBoost = this.jumpDir === -1 ? 5 : 1;
                if (this.#keyPresses.a) {
                    this.posX -= SPEED.HOR_WALK * jumpBoost;
                } else if (this.#keyPresses.d) {
                    this.posX += SPEED.HOR_WALK * jumpBoost;
                }
    
                const noJumpPosY = this.getSpiderPosY(this.curFloor);
                if (this.#keyPresses.k && this.jumpDir === 0 &&
                    (this.prevJumpEnd === -1 || timeStamp - this.prevJumpEnd > 500)) {
                    this.jumpDir = -1;
                    SOUNDS.JUMP.play();
                }
                if (this.jumpDir !== 0) {
                    const nextPosY = this.posY + this.jumpDir * SPEED.VER_JUMP;
                    if (!this.breakFloor &&
                        nextPosY < this.getFloorStartHeight(this.curFloor) - SPIDER_HEIGHT / 2 &&
                        this.jumpDir === -1
                    ) {
                        if (this.curFloor >= 0) {
                            const overlapWidth = this.removeBricks(
                                    this.curFloor - 1, this.posX, this.posX + SPIDER_WIDTH, this.curFloor > 0
                                );
                            if (this.curFloor > 0 && overlapWidth > 0) {
                                SOUNDS.BREAK_BRICK.play();
                            }
                            if (overlapWidth < SPIDER_WIDTH / 2) {
                                this.curFloor--;
                                this.breakFloor = true;
                                if (this.curFloor < VIEW.BOTTOM - 1 && this.curFloor >= VIEW.TOP) {
                                    this.shiftView(FLOOR_HEIGHT);
                                }
                            } else {
                                this.jumpDir = 1;
                            }
                        } else {
                            this.jumpDir = 1;
                        }
                    }
                    else if (this.breakFloor &&
                        nextPosY <= this.getFloorStartHeight(this.curFloor + 1) - SPIDER_HEIGHT * 2 - BRICK_HEIGHT) {
                        this.jumpDir = 1;
                        this.breakFloor = false;
                    }
                    else {
                        this.posY = nextPosY;
                        this.posX += this.jumpSlant * SPEED.HOR_WALK;
                    }
                    if (this.jumpDir === 1 && nextPosY > noJumpPosY) {
                        this.jumpDir = 0;
                        this.jumpSlant = 0;
                        this.posY = noJumpPosY;
                        this.breakFloor = false;
                        this.prevJumpEnd = document.timeline.currentTime;
                    }
                }

                if (this.jumpDir === 0 && (this.#keyPresses.a || this.#keyPresses.d)) {
                    this.imgInd = (this.imgInd + 1) % SPRITE_LEN;
                }
            }

            this.paintSpider(this.hasSilk);
        }

        window.requestAnimationFrame(this.spiderGameLoop);
    }

    renderSpider(state = STATE.NORMAL) {
        this.context.drawImage(
            spiderSprite,
            this.imgInd * spiderSprite.naturalWidth / SPRITE_LEN,
            state * spiderSprite.naturalHeight / 2,
            spiderSprite.naturalWidth / SPRITE_LEN,
            spiderSprite.naturalHeight / 2,
            this.posX,
            this.posY,
            SPIDER_WIDTH,
            SPIDER_HEIGHT
        );
    }

    paintSpider(hasLine = false, state = STATE.NORMAL) {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        if (hasLine) {
            this.context.lineTo(this.descendX, this.posY + 15);
            this.context.stroke();
        }
        this.renderSpider(state);
    }

    initPaintSpider() {
        if (spiderSprite.complete)
            this.renderSpider(0);
        else {
            spiderSprite.addEventListener("load", () => {
                this.renderSpider(0);
            });
        }
    }

    getSpiderPosX(floorID, pos) {
        return this.getFloorStartWidth(floorID) + pos * SPIDER_WIDTH / 2;
    }

    getSpiderPosY(floorID) {
        return this.getFloorStartHeight(floorID) + FLOOR_HEIGHT - SPIDER_HEIGHT;
    }

    getSpiderPos(floorID, pos) {
        return [
            this.getSpiderPosX(floorID, pos), this.getSpiderPosY(floorID)
        ];
    }

    intersectsWith(guestPosX, guestPosY, guestWidth, guestHeight) {
        return !(guestPosX > this.posX + SPIDER_WIDTH - MARGINX ||
            guestPosX + guestWidth < this.posX + MARGINX ||
            guestPosY > this.posY + SPIDER_HEIGHT - MARGINY ||
            guestPosY + guestHeight < this.posY + MARGINY);
    }

    setKeyPresses(key, value) {
        this.#keyPresses[key] = value;
    }

    spiderLoseLife(timeStamp) {
        if (timeStamp - this.startTimeStamp > SPEED.DIE_TIME + SPEED.DESCEND_TIME) {
            return;
        }

        if (timeStamp - this.startTimeStamp <= SPEED.DIE_TIME - 50) {
            if (timeStamp - this.prevTimeStamp >= 6000 / 96) {
                this.prevTimeStamp = timeStamp;
                this.imgInd = (this.imgInd + 1) % SPRITE_LEN;
                this.paintSpider(false, STATE.DEAD);
            }
        } else if (timeStamp - this.startTimeStamp < SPEED.DIE_TIME + 50) {
            this.posX = 300 + Math.floor(Math.random() * 600);
            this.descendX = this.posX + SPIDER_WIDTH / 2;
            this.posY = this.canvasHeight - window.innerHeight - SPIDER_HEIGHT;
            this.context.lineWidth = "6";
            this.context.fillStyle = "white";
            this.context.strokeStyle = "white";
            this.context.beginPath();
            this.context.moveTo(this.descendX, this.posY + 15);
        } else {
            this.posY = this.canvasHeight - window.innerHeight - SPIDER_HEIGHT + (timeStamp - this.startTimeStamp - SPEED.DIE_TIME) * SPEED.DESCEND_SPEED;
            this.paintSpider(true);
        }

        window.requestAnimationFrame(this.spiderLoseLife);
    }

    handleNewLife() {
        console.log("NEW LIFE");
        this.numLives--;
        this.isActive = false;
        this.isImmune = true;

        if (this.threadThin) {
            clearInterval(this.threadThin);
        }

        setTimeout(() => {
            SOUNDS.ONE_UP.play();

            this.startTimeStamp = document.timeline.currentTime;
    
            window.requestAnimationFrame(this.spiderLoseLife);
    
            setTimeout(() => {
                this.curFloor = 8;
                this.jumpDir = 0;
                this.prevJumpEnd = -1;
                this.prevShouldFall = true;
                this.isActive = true;
    
                this.prevTimeStamp = this.prevTimeStamp2 = document.timeline.currentTime;
                window.requestAnimationFrame(this.spiderGameLoop);
    
                this.hasSilk = true;
    
                let threadWidth = 6;
                this.threadThin = setInterval(() => {
                    if (threadWidth < 2 || !this.hasSilk) {
                        clearInterval(this.threadThin);
                        this.threadThin = null;
                        this.jumpDir = 1;
                        this.hasSilk = false;
                        this.isImmune = false;
                    }
                    SOUNDS.JUMP.play();
                    this.context.lineWidth = threadWidth - 2;
                    this.paintSpider(true);
                    threadWidth -= 2;
                }, 2000);
            }, SPEED.DIE_TIME + SPEED.DESCEND_TIME);
        }, SPEED.FREEZE_TIME);
    }

    resetSpider() {
        this.isActive = false;
        this.numLives = 3;
        [this.posX, this.posY] = this.getSpiderPos(9, 3);
        this.curFloor = 9;
        this.jumpDir = 0;
        this.prevJumpEnd = -1;
        this.prevShouldFall = true;
    }

    startMotion() {
        this.prevTimeStamp = this.prevTimeStamp2 = document.timeline.currentTime;
        window.requestAnimationFrame(this.spiderGameLoop);
    }

    startSpider() {
        this.numLives = 3;
        if (spiderSprite.complete) {
            this.startMotion();
        } else {
            spiderSprite.addEventListener("load", () => {
                this.startMotion();
            });
        }
    }
}