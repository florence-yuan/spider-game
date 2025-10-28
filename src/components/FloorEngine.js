const floorHeight = 150;
const floorBaseWidth = 510;
const floorUnitWidth = 90;
const brickHeight = 15;

export class FloorEngine {
    getFloorWidth(floorID) {
        return (floorID >= 0) ? (floorBaseWidth + floorID * floorUnitWidth) : (floorBaseWidth - floorUnitWidth * 3);
    }

    getFloorStartX(floorID, deviation = 0) {
        return (this.canvasWidth - this.getFloorWidth(floorID)) / 2 + deviation;
    }

    getFloorStartY(floorID) {
        return 300 + floorID * (floorHeight + brickHeight);
    }

    getFloorPos(floorID, pos, width) {
        return [this.getFloorStartX(floorID) + pos * width / 2, this.getFloorStartY(floorID)];
    }
}