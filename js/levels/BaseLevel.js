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
                } else {
                    var treasureCaveList = [];
                    if (Math.random() < 0.2) {
                        var tX = 1 + Math.floor(14 * Math.random());
                        var tY = 1 + Math.floor(14 * Math.random());
                        treasureCaveList[0] = new me.Vector2d(tX, tY);
                        if (Math.random() < 0.2) {
                            t = "treasure";
                            tX = 1 + Math.floor(14 * Math.random());
                            tY = 1 + Math.floor(14 * Math.random());
                            treasureCaveList[1] = new me.Vector2d(tX, tY);
                            if (Math.random() < 0.3) {
                                tX = 1 + Math.floor(14 * Math.random());
                                tY = 1 + Math.floor(14 * Math.random());
                                treasureCaveList[2] = new me.Vector2d(tX, tY);
                            }
                        }
                    }
                }

                var exitL = 2 + Math.floor(12 * Math.random());
                var exitU = 2 + Math.floor(12 * Math.random());
                if (chunkX > 0) {
                    exitL = this.chunks[chunkY][chunkX - 1].exitRight;
                }
                if (chunkY > 0) {
                    exitU = this.chunks[chunkY - 1][chunkX].exitDown;
                }

                this.chunks[chunkY][chunkX] = {
                    type: t,
                    caveX: 4 + Math.floor(8 * Math.random()),
                    caveY: 4 + Math.floor(8 * Math.random()),
                    exitLeft: exitL,
                    exitRight: 2 + Math.floor(12 * Math.random()),
                    exitUp: exitU,
                    exitDown: 2 + Math.floor(12 * Math.random()),
                    treasureCaves: treasureCaveList,
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
            newContents = game.ChunkGen.genCaveChunk(this, chunkX, chunkY);
        } else if (chunk.type == "treasure") {
            newContents = game.ChunkGen.genTreasureChunk(this, chunkX, chunkY);
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
        } else if (sample < 0.035) {
            return new game.BoneItem(x, y, level);
        }
        return null;
    },

    makeEmptyCaveContents: function(x, y, level) {
        var sample = Math.random();
        if (sample < 0.003) {
            return new game.TreasureItem(x, y, level, "bar");
        } else if (sample < 0.01) {
            return new game.TreasureItem(x, y, level, "nugget");
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

    makeDarkTreasureContents: function(x, y, level) {
        var sample = Math.random();
        if (sample < 0.1) {
            return new game.TreasureItem(x, y, level, "bar");
        } else if (sample < 0.11) {
            return new game.TreasureItem(x, y, level, "ruby");
        } else {
            return new game.TreasureItem(x, y, level, "nugget");
        }
    },

    makeCaveTreasure: function(x, y, level) {
        var sample = Math.random();
        if (sample < 0.25) {
            return new game.PowerupItem(x, y, level, "sight");
        } else if (sample < 0.4) {
            return new game.PowerupItem(x, y, level, "flame");
        } else if (sample < 0.6) {
            return new game.PowerupItem(x, y, level, "speed");
        } else {
            return new game.TreasureItem(x, y, level, "ruby");
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
                    var inside = this.makeDarkTileContents(
                            (xStart + x) * 16, (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "dark", inside, false);
                } else if (sample < 0.3) {
                    var inside = this.makeEmptyTileContents(
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
                if (sample < 0.08) {
                    var inside = this.makeDarkTreasureContents(
                            (xStart + x) * 16, (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "dark", inside, false);
                } else if (sample < 0.2) {
                    var inside = this.makeEmptyTileContents(
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

    genCaveChunk: function(level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = [];
        var isBlock = this.genIsBlockArray();

        var caveArray = this.caveShapes[
                Math.floor(Math.random() * this.caveShapes.length)];
        var caYOffset = -Math.floor(caveArray.length / 2);
        var caXOffset = -Math.floor(caveArray[0].length / 2);

        var chunk = level.getChunk(chunkX, chunkY);
        this.applyBlockShape(isBlock, caveArray, chunk.caveX + caXOffset,
                chunk.caveY + caYOffset);
        var tunnelChance = 0.75;
        if (Math.random() < tunnelChance) {
            this.digTunnel(isBlock, 0, chunk.exitLeft,
                    chunk.caveX, chunk.caveY);
        }
        if (Math.random() < tunnelChance) {
            this.digTunnel(isBlock, 15, chunk.exitRight,
                    chunk.caveX, chunk.caveY);
        }
        if (Math.random() < tunnelChance) {
            this.digTunnel(isBlock, chunk.exitUp, 0,
                    chunk.caveX, chunk.caveY);
        }
        if (Math.random() < tunnelChance) {
            this.digTunnel(isBlock, chunk.exitDown, 15,
                    chunk.caveX, chunk.caveY);
        }

        for (var i = 0; i < chunk.treasureCaves.length; i++) {
            var tCave = this.treasureCaveShapes[
                    Math.floor(Math.random() * this.treasureCaveShapes.length)];
            this.applyBlockShape(isBlock, tCave, chunk.treasureCaves[i].x - 1,
                    chunk.treasureCaves[i].y - 1);
        }

        var tiles = this.contentsFromBlockArray(isBlock, chunk.treasureCaves,
                xStart, yStart, level);

        return tiles;
    },

    genTreasureChunk: function(level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = [];
        var isBlock = this.genIsBlockArray();

        var chunk = level.getChunk(chunkX, chunkY);

        for (var i = 0; i < chunk.treasureCaves.length; i++) {
            var tCave = this.treasureCaveShapes[
                    Math.floor(Math.random() * this.treasureCaveShapes.length)];
            this.applyBlockShape(isBlock, tCave, chunk.treasureCaves[i].x - 1,
                    chunk.treasureCaves[i].y - 1);
        }

        var tiles = this.contentsFromBlockArray(isBlock, chunk.treasureCaves,
                xStart, yStart, level);

        return tiles;
    },

    /** Digs a random tunnel through BLOCKARRAY starting at (XSTART, YSTART) and
     *  ending at (XEND, YEND). */
    digTunnel: function(blockArray, xStart, yStart, xEnd, yEnd) {
        var dX = (xEnd - xStart) / 16;
        var dY = (yEnd - yStart) / 16;

        for (var i = 0; i < 16; i++) {
            var x = Math.floor(xStart + i * dX);
            var y = Math.floor(yStart + i * dY);
            if (blockArray[y][x] == 1) {
                var tunnelShape = this.tunnelShapes[
                        Math.floor(this.tunnelShapes.length * Math.random())];
                var xOffset = -Math.floor(tunnelShape[0].length / 2);
                var yOffset = -Math.floor(tunnelShape.length / 2);
                this.applyBlockShape(blockArray, tunnelShape, x + xOffset,
                        y + yOffset);
            }
        }
    },

    genIsBlockArray: function() {
        var isBlock = [];
        for (var y = 0; y < 16; y++) {
            isBlock[y] = [];
            for (var x = 0; x < 16; x++) {
                isBlock[y][x] = 1;
            }
        }
        return isBlock;
    },

    /** Given a 16*16 array of 0s and 1s BOOLARRAY and an NxN array of 0s and 1s
     *  SHAPEARRAY, remove the blocks in BOOLARRAY by applying SHAPEARRAY at the
     *  specified position XSTART, YSTART. */
    applyBlockShape: function(boolArray, shapeArray, xStart, yStart) {
        var height = shapeArray.length;
        var width = shapeArray[0].length;
        for (var y = 0; y < height; y++) {
            var yCoor = yStart + y;
            if (yCoor < 0 || yCoor >= 16) { continue; }
            for (var x = 0; x < width; x++) {
                var xCoor = xStart + x;
                if (xCoor < 0 || xCoor >= 16) { continue; }
                if (shapeArray[y][x] == 0) {
                    boolArray[yCoor][xCoor] = 0;
                }
            }
        }
    },

    /** Finally, generate an array of game tiles from an array of 0s and 1s
     *  BLOCKARRAY. Start the game tiles at block coordinates XSTART, YSTART
     *  given the LEVEL. Place treasures at locations in TREASURES. */
    contentsFromBlockArray: function(blockArray, treasures, xStart, yStart,
            level) {
        var contents = [];
        for (var y = 0; y < 16; y++) {
            contents[y] = [];
            for (var x = 0; x < 16; x++) {
                contents[y][x] = null;
                var inside = null;
                var type = "empty";

                for (var i = 0; i < treasures.length; i++) {
                    if (treasures[i].x == x && treasures[i].y == y) {
                        inside = this.makeCaveTreasure((xStart + x) * 16,
                                (yStart + y) * 16, level);
                    }
                }

                if (blockArray[y][x] == 1) {
                    var sample = Math.random();
                    if (sample < 0.06) {
                        inside = this.makeDarkTileContents(
                                (xStart + x) * 16, (yStart + y) * 16, level);
                        type = "dark";
                    } else if (sample < 0.18) {
                        inside = inside || this.makeEmptyTileContents(
                                (xStart + x) * 16, (yStart + y) * 16, level);
                        type = "empty";
                    } else {
                        inside = null;
                        type = "ice";
                    }
                } else {
                    inside = inside || this.makeEmptyCaveContents(
                            (xStart + x) * 16, (yStart + y) * 16, level);
                    type = "empty";
                }
                contents[y][x] = new game.GameTile(xStart + x,
                        yStart + y, type, inside, false);
            }
        }
        return contents;
    },

    caveShapes: [
        [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1],
        ],
    ],

    tunnelShapes: [
        [
            [0]
        ],

        [
            [0, 0],
            [0, 0]
        ],

        [
            [1, 0, 1],
            [0, 0, 0],
            [1, 0, 1],
        ]
    ],

    treasureCaveShapes: [
        [
            [1, 0, 1],
            [0, 0, 0],
            [1, 0, 1],
        ],

        [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ],
    ],
};
