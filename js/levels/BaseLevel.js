function BaseLevel(width, height) = {
    this.contents = []
    for (row = 0; row < height; row++) {
        this.contents[row] = []
        for (col = 0; col < width; col++) {
            this.contents[row][col] = Tile("empty0", null, false)
        }
    }
}

BaseLevel.prototype.get = function(x, y) {
    return this.contents[y][x];
}