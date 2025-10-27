const step = 30;

export class Guest {
    constructor(ctx, startFloor, x, y, width, height, img, isOutBound) {
        this.context = ctx;
        this.startFloor = startFloor;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = img;
        this.isOutBound = isOutBound;

        this.dir = Math.floor(Math.random() * 2) === 0 ? 1 : -1;
    }

    paintGuest() {
        this.img.addEventListener("load", () => {
            const width = this.height / this.img.naturalHeight * this.img.naturalWidth;
            // console.log(this.img, this.x, this.y, width, this.height);
            // console.log(thi)
            this.context.drawImage(this.img, this.x, this.y, width, this.height);
        });
    }

    moveGuest() {
        const width = this.height / this.img.naturalHeight * this.img.naturalWidth;
        // console.log(this.img, this.x, this.y, width, this.height);
        this.context.drawImage(this.img, this.x, this.y, width, this.height);
    }

    move() {
        let newX = this.x + this.dir * step;
        if (this.isOutBound(this.startFloor, newX)) {
            this.dir = -this.dir;
            newX = this.x + this.dir * step;
        }
        this.x = newX;

        const width = this.height / this.img.naturalHeight * this.img.naturalWidth;
        // console.log(this.img, this.x, this.y, width, this.height);
        this.context.drawImage(this.img, this.x, this.y, width, this.height);
    }
}