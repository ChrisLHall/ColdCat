/**
 * Extra information for the Tile object. Static arrays that I don't want to
 * instantiate every time.
 */
game.GameTileTypes = {
    "empty": [ "empty0", "empty1", "empty2" ],
    "ice": [ "ice0" ],
    "dark": [ "dark0" ],
    "cat": [ "cat0" ],
    "all": [ "empty0", "empty1", "empty2", "ice0", "dark0" , "cat0" ]
};

game.GameTileFrames = {
    "unknown": [4],
    "empty0": [10],
    "empty1": [20],
    "empty2": [30],
    "ice0": [11],
    "dark0": [12],
    "cat0": [13],
};

/**
 * Tile data object, which contains the appearance and contents of a tile. If
 * the tile isn't solid, then the contents are immediately dropped.
 */
game.GameTile = me.ObjectEntity.extend({
    init: function(blockX, blockY, type, contents, seeThrough) {
        var settings = {};
        settings.image = me.loader.getImage("tiles");
        settings.spritewidth = 16;
        settings.spriteheight = 16;

        this.parent(blockX * 16, blockY * 16, settings);

        this.anchorPoint.set(0.0, 0.0);

        this.gravity = 0;
        this.alwaysUpdate = true;

        this.collidable = false;

        this.setType(type);
        this.contents = contents;
        this.seeThrough = seeThrough;

        // Don't let empty tiles have any contents
        if (!this.isSolid()) {
            this.yieldContents();
        }
    },

    update: function() {
        this.x += me.timer.tick / 10.0;
        this.y += me.timer.tick / 10.0;
    },

    isSolid: function() {
        if (this.type == "unknown"
                || game.GameTileTypes["empty"].indexOf(this.type) > -1) {
            return false;
        }
        return true;
    },

    setType: function(newType) {
        if (newType in game.GameTileTypes) {
            this.type = game.GameTileTypes[newType][Math.floor(Math.random()
                * game.GameTileTypes[newType].length)];
        } else if (newType in game.GameTileFrames) {
            this.type = newType;
        } else {
            this.type = "unknown"
        }
        this.renderable.addAnimation(this.type, game.GameTileFrames[this.type]);
        this.renderable.setCurrentAnimation(this.type);
    },

    draw: function(context) {
        this.parent(context);
        if (this.seeThrough && this.contents != null) {
            this.contents.draw(context);
        }
    },

    dig: function() {
        if (game.GameTileTypes["empty"].indexOf(this.type) > -1) {
            return;
        }

        if (game.GameTileTypes["ice"].indexOf(this.type) > -1
                || game.GameTileTypes["dark"].indexOf(this.type) > -1
                || game.GameTileTypes["cat"].indexOf(this.type) > -1) {
            this.setType("empty");
            this.yieldContents();
            this.seeThrough = true;
        }
    },

    yieldContents: function() {
        if (this.contents != null) {
            me.game.add(this.contents, 5);
            this.contents = null;
        }
    }
});