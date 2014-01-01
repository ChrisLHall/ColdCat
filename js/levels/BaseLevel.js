game.BaseLevel = me.Renderable.extend({
    /** Initialize the base level with given position, width and height
     *  (in 16x16 block CHUNKS, made up of 16x16 pixel BLOCKS). */
    init: function(chunksWidth, chunksHeight) {
        this.view = new me.Vector2d(this.xView, this.yView);

        this.chunksX = chunksWidth;
        this.chunksY = chunksHeight;
        this.blocksX = this.chunksX * 16;
        this.blocksY = this.chunksY * 16;
        this.parent(new me.Vector2d(0, 0), this.blocksX * 16,
                this.blocksY * 16);

        this.anchorPoint = new me.Vector2d(0, 0);
        this.floating = false;
        this.collidable = false;

        this.playerStartX = Math.floor(this.blocksX / 2);
        this.playerStartY = Math.floor(this.blocksY / 2);

        var startChunkX = Math.floor(this.playerStartX / 16);
        var startChunkY = Math.floor(this.playerStartY / 16);

        this.catChunkX = startChunkX;
        this.catChunkY = startChunkY;
        while (Math.pow(this.catChunkX - startChunkX, 2)
                + Math.pow(this.catChunkY - startChunkY, 2)
                < Math.pow(Math.min(this.chunksX, this.chunksY) / 2, 2) - 2) {
            this.catChunkX = Math.floor(Math.random() * this.chunksX);
            this.catChunkY = Math.floor(Math.random() * this.chunksY);
        }
        this.catBlockX = 16*this.catChunkX + 1 + Math.floor(14 * Math.random());
        this.catBlockY = 16*this.catChunkY + 1 + Math.floor(14 * Math.random());

        this.chunks = [];
        for (var chunkY = 0; chunkY < this.chunksY; chunkY++) {
            this.chunks[chunkY] = [];
            for (var chunkX = 0; chunkX < this.chunksX; chunkX++) {
                var t = "normal";
                if (chunkX == startChunkX && chunkY == startChunkY) {
                    t = "player";
                } else if (chunkX == this.catChunkX
                        && chunkY == this.catChunkY) {
                    t = "cat";
                }
                this.chunks[chunkY][chunkX] = {
                    type: t,
                    contents: null
                };
            }
        }

        game.data.timermax = game.data.BIGBONETIME * 13;
        game.data.timer = game.data.timermax;
        game.data.timeTaken = 0;

        this.player = null;
        this.createPlayerAt(this.playerStartX, this.playerStartY);
        this.meowTimer = Math.floor(60 + 100*Math.random());
    },

    update: function() {
        game.data.closeToCat = false;
        if (!game.data.gotCat && !game.data.playerLost) {
            game.data.timeTaken += 1;
            if (game.data.timer > 0) {
                game.data.timer -= 1;
            } else {
                game.data.timer = 0;
                game.data.playerLost = true;
                if (this.player != null) {
                    me.game.remove(this.player);
                    this.player = null;
                }
            }
            if (this.meowTimer > 0) {
                this.meowTimer -= 1;
            } else if (this.meowTimer == 0) {
                this.meowTimer = Math.floor(80 + 80*Math.random());
                me.game.add(new game.Meow(
                        16*(this.catBlockX - 8 + 16*Math.random()),
                        16*(this.catBlockY - 8 + 16*Math.random()),
                        this), 1000);
            }
            if (this.player != null) {
                var squareDist =
                        Math.pow(this.player.pos.x - 16*this.catBlockX, 2)
                        + Math.pow(this.player.pos.y - 16*this.catBlockY, 2);
                //(8*16)^2 = 16384
                if (squareDist <= 16384) {
                    game.data.closeToCat = true;
                }
            }
            
        } else {
            if (this.player != null) {
                me.game.remove(this.player);
                this.player = null;
            }
        }
        return true;
    },

    draw: function(context) {
        var startBlockX = Math.floor(this.xView / 16.0);
        var startBlockY = Math.floor(this.yView / 16.0);
        var iterationsX = 19; //Math.min(19, this.blocksX - startBlockX);
        var iterationsY = 14; //Math.min(14, this.blocksY - startBlockY);
        for (var x = 0; x < iterationsX; x++) {
            for (var y = 0; y < iterationsY; y++) {
                this.get(startBlockX + x, startBlockY + y).draw(context);
            }
        }
    },

    inBounds: function(x, y) {
        return (x >= 0 && y >= 0 && x < this.blocksX && y < this.blocksY);
    },

    get: function(x, y) {
        var cX = Math.floor(x / 16);
        var dX = x - 16 * cX;
        var cY = Math.floor(y / 16);
        var dY = y - 16 * cY;
        var chunk = this.getChunk(cX, cY);
        if (chunk.contents == null) {
            this.populateChunk(cX, cY);
        }
        return chunk.contents[dY][dX];
    },

    set: function(x, y, tile) {
        var cX = Math.floor(x / 16);
        var dX = x - 16 * cX;
        var cY = Math.floor(y / 16);
        var dY = y - 16 * cY;
        var chunk = this.getChunk(cX, cY);
        if (chunk.contents == null) {
            this.populateChunk(cX, cY);
        }
        chunk.contents[dY][dX] = tile;
    },

    getChunk: function(chunkX, chunkY) {
        return this.chunks[chunkY][chunkX];
    },

    populateChunk: function(chunkX, chunkY) {
        var chunk = this.getChunk(chunkX, chunkY);
        var newContents = [];

        if (chunk.type == "normal") {
            newContents = game.ChunkGen.genNormalChunk(this, chunkX, chunkY);
        } else if (chunk.type == "player") {
            newContents = game.ChunkGen.genPlayerChunk(this, chunkX, chunkY);
        } else if (chunk.type == "cat") {
            newContents = game.ChunkGen.genCatChunk(this, chunkX, chunkY);
        } else {
            newContents = game.ChunkGen.genUnknownChunk(this, chunkX, chunkY);
        }

        chunk.contents = newContents;
    },

    isSolid: function(x, y) {
        return this.get(x, y).isSolid();
    },

    createPlayerAt: function(x, y) {
        this.set(x, y, new game.GameTile(x, y, "empty", null, false));
        this.player = new game.PlayerEntity(x, y, this);
        me.game.add(this.player, 10);

        me.game.viewport.setBounds(384, 216);
        me.game.viewport.setDeadzone(0, 0);
    },

    digBlock: function(x, y) {
        this.get(x, y).dig();
    }
});

game.ChunkGen = {
    makeEmptyTileContents: function(x, y, level) {
        var sample = Math.random();
        if (sample < 0.01) {
            return new game.TreasureItem(x, y, level, "bar");
        } else if (sample < 0.03) {
            return new game.TreasureItem(x, y, level, "nugget");
        } else if (sample < 0.0325) {
            return new game.BoneItem(x, y, level);
        }
        return null;
    },

    makeDarkTileContents: function(x, y, level) {
        var sample = Math.random();
        if (sample < 0.1) {
            return new game.BoneItem(x, y, level);
        } else if (sample < 0.3) {
            return new game.TreasureItem(x, y, level, "bar");
        } else if (sample < 0.35) {
            return new game.TreasureItem(x, y, level, "ruby");
        } else if (sample < 0.38) {
            return new game.PowerupItem(x, y, level, "sight");
        } else if (sample < 0.41) {
            return new game.PowerupItem(x, y, level, "flame");
        } else if (sample < 0.44) {
            return new game.PowerupItem(x, y, level, "speed");
        } else {
            return new game.TreasureItem(x, y, level, "nugget");
        }
    },

    genUnknownChunk: function(level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = [];
        for (var y = 0; y < 16; y++) {
            newContents[y] = []
            for (var x = 0; x < 16; x++) {
                newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "unknown", null, false);
            }
        }
        return newContents;
    },

    genPlayerChunk: function(level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = [];
        for (var y = 0; y < 16; y++) {
            newContents[y] = []
            for (var x = 0; x < 16; x++) {
                newContents[y][x] = null;
                var sample = Math.random();
                if (sample < 0.6) {
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "empty", null, false);
                } else {
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "ice", null, false);
                }
            }
        }
        return newContents;
    },

    genNormalChunk: function(level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = [];

        for (var y = 0; y < 16; y++) {
            newContents[y] = []
            for (var x = 0; x < 16; x++) {
                newContents[y][x] = null;
                var sample = Math.random();
                if (sample < 0.04) {
                    var inside = game.ChunkGen.makeDarkTileContents(
                            (xStart + x) * 16, (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "dark", inside, false);
                } else if (sample < 0.3) {
                    var inside = game.ChunkGen.makeEmptyTileContents(
                            (xStart + x) * 16, (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "empty", inside, false);
                } else {
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "ice", null, false);
                }
            }
        }
        return newContents;
    },

    genCatChunk: function(level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = [];

        var xCat = level.catBlockX - 16*chunkX;
        var yCat = level.catBlockY - 16*chunkY;

        for (var y = 0; y < 16; y++) {
            newContents[y] = []
            for (var x = 0; x < 16; x++) {
                newContents[y][x] = null;
                if (x == xCat && y == yCat) {
                    var cat = new game.CatItem((xStart + x) * 16,
                            (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "dark", cat, false);
                    continue;
                }
                var sample = Math.random();
                if (sample < 0.02) {
                    var inside = game.ChunkGen.makeDarkTileContents(
                            (xStart + x) * 16, (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "dark", inside, false);
                } else if (sample < 0.23) {
                    var inside = game.ChunkGen.makeEmptyTileContents(
                            (xStart + x) * 16, (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "empty", inside, false);
                } else {
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "ice", null, false);
                }
            }
        }
        return newContents;
    },
};
