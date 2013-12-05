game.BaseLevel = me.Renderable.extend({
    /** Initialize the base level with given position, width and height
     *  (IN 16x16 BLOCKS). */
    init: function(x, y, width, height) {
        this.parent(new me.Vector2d(x, y), width * 16, height * 16);

        this.anchorPoint = new me.Vector2d(0, 0);
        

        this.contents = []
        for (row = 0; row < height; row++) {
            this.contents[row] = []
            for (col = 0; col < width; col++) {
                this.contents[row][col] = game.Tile("empty0", null, false)
            }
        }

        this.collidable = false;
    },

    update: function() {
        this.parent();

        return true;
    },

    draw: function(context) {
        
    },

    get: function(x, y) {
        return this.contents[y][x];
    },

    set: function(x, y, tile) {
        this.contents[y][x] = tile
    }
});
