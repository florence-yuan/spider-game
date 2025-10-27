const LINE_WIDTH = 1.5;

export class Brick {
    constructor(ctx, x, y, width, height) {
        this.context = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    paintBrick() {
        const ctx = this.context;
        // ctx.fillStyle = "#422341";
        ctx.fillStyle = "#f9ae79";
        ctx.strokeStyle = "#55240b";
        ctx.lineWidth = LINE_WIDTH;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x + LINE_WIDTH / 2, this.y + LINE_WIDTH / 2, this.width - LINE_WIDTH, this.height - LINE_WIDTH);
    }

    removeBrick() {
        this.context.clearRect(this.x, this.y, this.width, this.height);
    }
}