const GUEST_WIDTH = 88;
const GUEST_HEIGHT = 120;

const FLOOR_HEIGHT = 150;
const BRICK_HEIGHT = 15;

const SPEED = {
    HOR_WALK: 10,
    VER_JUMP: (FLOOR_HEIGHT + BRICK_HEIGHT) / 3,
};

const ERROR_MARGIN = 5;

const sprite = new Image();
sprite.src = process.env.PUBLIC_URL + 'images/guest_sprite.png';

const SPRITE_LEN = 5;

export class GuestEngine {
    constructor(
        charCtx, canvasWidth, canvasHeight,
        numFloors, floorBounds,
        hasBricks, intersectsSpider, resetScene
    ) {
        this.context = charCtx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.numFloors = numFloors;
        this.floorBounds = floorBounds;
        this.hasBricks = hasBricks;
        this.intersectsSpider = intersectsSpider;
        this.resetScene = resetScene;
        
        this.guestIsOutBound = this.guestIsOutBound.bind(this);
        this.moveGuests = this.moveGuests.bind(this);
        this.imgInd = 0;

        this.isActive = true;

        this.setGuestBounds();
    }

    setGuestBounds() {
        this.guests = [];
        for (let i = 0; i < this.numFloors - 1; i++) {
            const guestX = Math.random() * (this.floorBounds[i][2] - GUEST_WIDTH) + this.floorBounds[i][0];
            this.guests.push([
                i,
                guestX,
                this.floorBounds[i][1] + FLOOR_HEIGHT - GUEST_HEIGHT,
                Math.floor(Math.random() * 2) === 0 ? -1 : 1,      // direction of walk
                0       // remaining jump
            ]);
        };
    }

    guestIsOutBound(curFloor, x) {
        return curFloor < 0 || curFloor >= this.numFloors ||
            x < this.floorBounds[curFloor][0] ||
            x + GUEST_WIDTH > this.floorBounds[curFloor][0] + this.floorBounds[curFloor][2];
        
    }

    moveGuests(timeStamp) {
        if (!this.isActive) {
            return;
        }
        if (timeStamp - this.prevTimeStamp >= 6000 / 72) {
            let freeze = false;
            this.prevTimeStamp = timeStamp;
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            
            this.imgInd = (this.imgInd + 1) % SPRITE_LEN;
            for (let guestID in this.guests) {
                if (this.moveGuest(guestID) < 0) {
                    freeze = true;
                }
            }

            if (freeze)
                return;
        }

        window.requestAnimationFrame(this.moveGuests);
    }

    paintGuest(guestID, spriteInd = 0) {
        const width = GUEST_HEIGHT / (sprite.naturalHeight / 2) * (sprite.naturalWidth / SPRITE_LEN);
        const dir = this.guests[guestID][3] === -1 ? 0 : 1;
        // console.log(this.img, this.x, this.y, width, this.height);
        this.context.drawImage(
            sprite,
            spriteInd * sprite.naturalWidth / SPRITE_LEN,
            dir * sprite.naturalHeight / 2,
            sprite.naturalWidth / SPRITE_LEN,
            sprite.naturalHeight / 2,
            this.guests[guestID][1],
            this.guests[guestID][2],
            width,
            GUEST_HEIGHT
        );
    }

    moveGuest(guestID) {
        if (this.guests[guestID][0] < 0)
            return 0;

        const guestBounds = this.guests[guestID];
        let newX = guestBounds[1] + guestBounds[3] * SPEED.HOR_WALK;
        if (guestBounds[4] > 0) {
            if (guestBounds[4] === 3) {
                guestBounds[0]++;
            }
            guestBounds[2] += SPEED.VER_JUMP;
            guestBounds[4]--;
        } else if (this.guestIsOutBound(guestBounds[0], newX)) {
            guestBounds[3] = -guestBounds[3];
            newX = guestBounds[1] + guestBounds[3] * SPEED.HOR_WALK;
        } else if (!this.hasBricks(guestBounds[0], newX, newX + GUEST_WIDTH)) {
            // console.log("HAHAPPEN", guestBounds[0])
            if (guestBounds[0] >= 9) {
                guestBounds[0] = -1;       // TODO: REPLACE WITH NEW GUEST
                return 0;
            }
            // guestBounds[1] += SPEED.HOR_WALK * 2;
            guestBounds[4] = 3;
        }
        guestBounds[1] = newX;

        this.paintGuest(guestID, this.imgInd, this.imgDir);

        if (this.intersectsSpider([guestBounds[1], guestBounds[2], GUEST_WIDTH, GUEST_HEIGHT])) {
            console.log("!!!1 UP!!!");
            this.resetScene();
            return -1;
        }

        return 0;
    }

    startMotion() {
        window.requestAnimationFrame(this.moveGuests);
    }

    startHelper() {
        for (let guest in this.guests) {
            this.paintGuest(guest);
        }
        this.prevTimeStamp = document.timeline.currentTime;
        this.imgDir = 1;
    }

    startGuests() {
        this.startMotion();
    }

    paintGuests() {
        if (sprite.complete) {
            this.startHelper();
        } else {
            sprite.addEventListener("load", () => {
                this.startHelper();
            });
        }
    }
}