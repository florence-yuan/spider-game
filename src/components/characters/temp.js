if (this.jumpTime > 0) {
    if (this.jumpTime > this.curJumpDur / 2) {
        this.posY -= stepY;
    } else {
        this.posY += stepY;
    }
    this.jumpTime--;
    
    if (this.curJumpDur === jumpDur && this.jumpTime === this.curJumpDur / 2) {
        const isClear = this.removeBricks(
            this.curFloor - 1, this.posX, this.posX + spiderWidth
        );
        console.log('isClear', isClear)
        if (isClear) {
            this.jumpTime += jumpDur2 - jumpDur;
            this.curJumpDur = jumpDur2;
            this.curFloor--;
        }
    }
}