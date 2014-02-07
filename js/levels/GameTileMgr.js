/**
 * Extra information for the Tile object. Static arrays that I don't want to
 * instantiate every time.
 */
game.GameTileMgrTypes = {
    "empty": [ "e0", "e1", "e2" ],
    "ice": [ "i0" ],
    "dark": [ "d0" ],
    "cat": [ "c0" ],
    "all": [ "e0", "e1", "e2", "i0", "d0" , "c0" ]
};

game.GameTileMgrFrames = {
    "unknown": 4,
    "e0": 10,
    "e1": 20,
    "e2": 30,
    "i0": 11,
    "d0": 12,
    "c0": 13,
};

/**
 * Object that manages tile data. Tiles are structured like this:
 *
 * { frame: "e0", seeThrough:false, contents: null }
 * Most of these functions operate on 16x16 arrays of tiles.
 */
game.GameTileMgr = {
    isSolid: function(tile) {
        if (tile.frame == "unknown"
                || game.GameTileMgrTypes["empty"].indexOf(tile.frame) > -1) {
            return false;
        }
        return true;
    },

    setType: function(tile, newType) {
        if (newType in game.GameTileMgrTypes) {
            tile.frame = game.GameTileMgrTypes[newType][Math.floor(Math.random()
                * game.GameTileMgrTypes[newType].length)];
        } else if (newType in game.GameTileMgrFrames) {
            tile.frame = newType;
        } else {
            tile.frame = "unknown"
        }
        if (!this.isSolid(tile)) {
            this.yieldContents(tile);
        }
    },

    draw: function(tile, x, y, context) {
        var f = game.GameTileMgrFrames[tile.frame];
        var col = f % 10;
        var row = Math.floor(f / 10);
        context.drawImage(me.loader.getImage("tiles"), 16*col, 16*row, 16, 16,
                x, y, 16, 16);
        if (tile.seeThrough && tile.contents != null) {
            tile.contents.draw(context);
        }
    },

    dig: function(tile) {
        if (game.GameTileMgrTypes["empty"].indexOf(tile.frame) > -1) {
            return;
        }

        if (game.GameTileMgrTypes["ice"].indexOf(tile.frame) > -1
                || game.GameTileMgrTypes["dark"].indexOf(tile.frame) > -1
                || game.GameTileMgrTypes["cat"].indexOf(tile.frame) > -1) {
            this.setType(tile, "empty");
        }
    },

    yieldContents: function(tile) {
        if (tile.contents != null) {
            me.game.add(tile.contents, 5);
            tile.contents = null;
        }
    },

    /** Returns a new tile with the given FRAME NAME, whether it IS SEETHROUGH,
     *  and with given TILE CONTENTS. */
    makeTile: function(frameName, isSeeThrough, tileContents) {
        var tile = {frame: "unknown", seeThrough: isSeeThrough,
                contents: tileContents};
        this.setType(tile, frameName);
        return tile;
    },

    genIceTileChunk: function() {
        var contents = [];
        for (var row = 0; row < 16; row++) {
            contents[row] = [];
            for (var col = 0; col < 16; col++) {
                contents[row][col] = this.makeTile("empty", false, null);
            }
        }
    },
};