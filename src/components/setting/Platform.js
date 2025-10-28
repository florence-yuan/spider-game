import { Floor } from "./Floor";

const DEVIATION = 200;
const CYCLE_LEN = 7000;

export class Platform extends Floor {
    constructor(...props) {
        super(...props);

        this.platformFloat = this.platformFloat.bind(this);
        this.paintPlatform = this.paintPlatform.bind(this);
        this.curDev = -DEVIATION;
    }

    platformFloat(timeStamp) {
        if (timeStamp - this.prevTimeStamp >= CYCLE_LEN) {
            this.prevTimeStamp = timeStamp;
        }
        if (timeStamp - this.prevTimeStamp <= CYCLE_LEN / 2) {
            this.curDev = DEVIATION * 2 / (CYCLE_LEN / 2)
                        * (timeStamp - this.prevTimeStamp) - DEVIATION
        } else {
            this.curDev = DEVIATION - DEVIATION * 2 / (CYCLE_LEN / 2)
                        * (timeStamp - this.prevTimeStamp - CYCLE_LEN / 2);
        }
        this.paintFloor(
            false,
            this.curDev,
            1,
            true
        );
        window.requestAnimationFrame(this.platformFloat);
    }

    startMotion() {
        window.requestAnimationFrame(this.platformFloat);
    }

    paintPlatform() {
        this.paintFloor(false, -DEVIATION, 1);
        this.prevTimeStamp = document.timeline.currentTime;
    }
}