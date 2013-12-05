/**
 * Tile data object, which contains the appearance and contents of a tile.
 */
game.GameTile = me.ObjectEntity.extend({
    init: function(x, y, type, contents, seethrough) {
        var settings = {};
        settings.image = me.loader.getImage("tiles");
        settings.spriteWidth = 169;
        settings.spriteHeight = 169;

        this.parent(x, y, settings);

        this.anchorPoint.set(0.0, 0.0);

        this.gravity = 0;
        this.alwaysUpdate = true;

        this.collidable = true;

        this.type = type;
        this.contents = contents;
        this.seethrough = seethrough;
    },

    update: function() {
        this.x += me.timer.tick / 10.0;
        this.y += me.timer.tick / 10.0;
    }
});