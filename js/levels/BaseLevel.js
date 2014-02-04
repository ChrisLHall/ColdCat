game.BaseLevel = me.Renderable.extend({
    /** Initialize the base level with given position, width and height
     *  (in 16x16 block CHUNKS, made up of 16x16 pixel BLOCKS). */
    init: function(chunksWidth, chunksHeight, timeBones) {
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

        this.startChunkX = 0;
        this.startChunkY = 0;
        this.catChunkX = 0;
        this.catChunkY = 0;

        // Make sure the distance between the starting chunks is 2/3 the max
        // possible distance, give or take 1.
        while (Math.abs(Math.abs(this.catChunkX - this.startChunkX)
                + Math.abs(this.catChunkY - this.startChunkY)
                - (this.chunksX + this.chunksY) * 0.6)
                >= 1) {
            this.catChunkX = Math.floor(Math.random() * this.chunksX);
            this.catChunkY = Math.floor(Math.random() * this.chunksY);
            this.startChunkX = Math.floor(Math.random() * this.chunksX);
            this.startChunkY = Math.floor(Math.random() * this.chunksY);
        }
        this.catBlockX = 16*this.catChunkX + 1 + Math.floor(14 * Math.random());
        this.catBlockY = 16*this.catChunkY + 1 + Math.floor(14 * Math.random());
        this.playerStartX = 16*this.startChunkX
                + 1 + Math.floor(14 * Math.random());
        this.playerStartY = 16*this.startChunkY
                + 1 + Math.floor(14 * Math.random());

        this.chunks = [];
        for (var chunkY = 0; chunkY < this.chunksY; chunkY++) {
            this.chunks[chunkY] = [];
            for (var chunkX = 0; chunkX < this.chunksX; chunkX++) {
                var t = "normal";
                if (chunkX == this.startChunkX && chunkY == this.startChunkY) {
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
                    isBlockArray: null,
                    contents: null,
                    contentsFinished: false
                };
            }
        }

        game.data.timermax = game.data.BIGBONETIME * timeBones;
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
                game.ChunkGen.makeNearestBlock(
                        Math.round(this.player.pos.x / 16),
                        Math.round(this.player.pos.y / 16), this);
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
        var dX = x % 16;
        var cY = Math.floor(y / 16);
        var dY = y % 16;
        var chunk = this.getChunk(cX, cY);
        if (chunk.isBlockArray == null) {
            this.populateChunk(cX, cY);
            game.ChunkGen.makeContents(chunk, x, y, this);
        } else if (chunk.contents[dY][dX] == null) {
            game.ChunkGen.makeContents(chunk, x, y, this);
        }
        return chunk.contents[dY][dX];
    },

    set: function(x, y, tile) {
        var cX = Math.floor(x / 16);
        var dX = x % 16;
        var cY = Math.floor(y / 16);
        var dY = y % 16;
        var chunk = this.getChunk(cX, cY);
        if (chunk.isBlockArray == null) {
            this.populateChunk(cX, cY);
        }
        chunk.contents[dY][dX] = tile;
    },

    getChunk: function(chunkX, chunkY) {
        return this.chunks[chunkY][chunkX];
    },

    populateChunk: function(chunkX, chunkY) {
        var chunk = this.getChunk(chunkX, chunkY);
        chunk.isBlockArray = game.ChunkGen.genIsBlockArray();
        chunk.contents = game.ChunkGen.genEmptyContents();

        if (chunk.type == "normal") {
            game.ChunkGen.genCaveChunk(chunk, this, chunkX, chunkY);
        } else if (chunk.type == "treasure") {
            game.ChunkGen.genTreasureChunk(chunk, this, chunkX, chunkY);
        } else if (chunk.type == "player") {
            game.ChunkGen.genPlayerChunk(chunk, this, chunkX, chunkY);
        } else if (chunk.type == "cat") {
            game.ChunkGen.genCatChunk(chunk, this, chunkX, chunkY);
        } else {
            game.ChunkGen.genUnknownChunk(chunk, this, chunkX, chunkY);
        }
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
        if (sample < 0.025) {
            return new game.TreasureItem(x, y, level, "bar");
        } else if (sample < 0.065) {
            return new game.TreasureItem(x, y, level, "nugget");
        } else if (sample < 0.08) {
            return new game.BoneItem(x, y, level);
        }
        return null;
    },

    makeEmptyCaveContents: function(x, y, level) {
        var sample = Math.random();
        if (sample < 0.006) {
            return new game.TreasureItem(x, y, level, "bar");
        } else if (sample < 0.02) {
            return new game.TreasureItem(x, y, level, "nugget");
        }
        return null;
    },

    makeDarkTileContents: function(x, y, level) {
        var sample = Math.random();

        if (sample < 0.15) {
            return new game.BoneItem(x, y, level);
        } else if (sample < 0.45) {
            return new game.TreasureItem(x, y, level, "bar");
        } else if (sample < 0.51) {
            return new game.TreasureItem(x, y, level, "ruby");
        } else if (sample < 0.57) {
            return new game.PowerupItem(x, y, level, "sight");
        } else if (sample < 0.61) {
            return new game.PowerupItem(x, y, level, "flame");
        } else if (sample < 0.66) {
            return new game.PowerupItem(x, y, level, "speed");
        } else {
            return new game.TreasureItem(x, y, level, "nugget");
        }
    },

    makeDarkTreasureContents: function(x, y, level) {
        var sample = Math.random();
        if (sample < 0.2) {
            return new game.TreasureItem(x, y, level, "bar");
        } else if (sample < 0.25) {
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

    genUnknownChunk: function(chunk, level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = chunk.contents;
        for (var y = 0; y < 16; y++) {
            for (var x = 0; x < 16; x++) {
                newContents[y][x] = new game.GameTile(xStart + x,
                        yStart + y, "unknown", null, false);
            }
        }
        chunk.contentsFinished = true;
    },

    genPlayerChunk: function(chunk, level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = chunk.contents;
        for (var y = 0; y < 16; y++) {
            for (var x = 0; x < 16; x++) {
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
        chunk.contentsFinished = true;
    },

    genNormalChunk: function(chunk, level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = chunk.contents;

        for (var y = 0; y < 16; y++) {
            for (var x = 0; x < 16; x++) {
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
        chunk.contentsFinished = true;
    },

    genCatChunk: function(chunk, level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var newContents = chunk.contents;

        var xCat = level.catBlockX - 16*chunkX;
        var yCat = level.catBlockY - 16*chunkY;

        for (var y = 0; y < 16; y++) {
            for (var x = 0; x < 16; x++) {
                if (x == xCat && y == yCat) {
                    var cat = new game.CatItem((xStart + x) * 16,
                            (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "cat", cat, false);
                    continue;
                }
                var sample = Math.random();
                if (sample < 0.12) {
                    var inside = this.makeDarkTreasureContents(
                            (xStart + x) * 16, (yStart + y) * 16, level);
                    newContents[y][x] = new game.GameTile(xStart + x,
                            yStart + y, "dark", inside, false);
                } else if (sample < 0.20) {
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
        chunk.contentsFinished = true;
    },

    genCaveChunk: function(chunk, level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var isBlock = chunk.isBlockArray;

        var caveArray = this.caveShapes[
                Math.floor(Math.random() * this.caveShapes.length)];
        var caYOffset = -Math.floor(caveArray.length / 2);
        var caXOffset = -Math.floor(caveArray[0].length / 2);

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
    },

    genTreasureChunk: function(chunk, level, chunkX, chunkY) {
        var xStart = 16 * chunkX;
        var yStart = 16 * chunkY;
        var isBlock = chunk.isBlockArray;

        for (var i = 0; i < chunk.treasureCaves.length; i++) {
            var tCave = this.treasureCaveShapes[
                    Math.floor(Math.random() * this.treasureCaveShapes.length)];
            this.applyBlockShape(isBlock, tCave, chunk.treasureCaves[i].x - 1,
                    chunk.treasureCaves[i].y - 1);
        }
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

    /** Create an empty contents array. */
    genEmptyContents: function() {
        var contents = [];
        for (var y = 0; y < 16; y++) {
            contents[y] = [];
            for (var x = 0; x < 16; x++) {
                contents[y][x] = null;
            }
        }
        return contents;
    },

    /** Finally, generate a game tile from an array of 0s and 1s
     *  blockarray from CHUNK. Start the game tiles at block coordinates X, Y
     *  given the LEVEL. Place treasures at locations in the chunk. */
    makeContents: function(chunk, x, y, level) {
        var blockArray = chunk.isBlockArray;
        var treasures = chunk.treasureCaves;
        var contents = chunk.contents;

        var xOff = x % 16;
        var yOff = y % 16;
        var xStart = x - xOff;
        var yStart = y - yOff;

        var inside = null;
        var type = "empty";

        for (var i = 0; i < treasures.length; i++) {
            if (treasures[i].x == xOff
                    && treasures[i].y == yOff) {
                inside = this.makeCaveTreasure(x * 16, y * 16, level);
            }
        }

        if (blockArray[yOff][xOff] == 1) {
            var sample = Math.random();
            if (sample < 0.08) {
                inside = inside || this.makeDarkTileContents(
                        x * 16, y * 16, level);
                type = "dark";
            } else if (sample < 0.25) {
                inside = inside || this.makeEmptyTileContents(
                        x * 16, y * 16, level);
                type = "empty";
            } else {
                inside = null;
                type = "ice";
            }
        } else {
            inside = inside || this.makeEmptyCaveContents(
                    x * 16, y * 16, level);
            type = "empty";
        }
        contents[yOff][xOff] = new game.GameTile(x, y, type, inside, false);
    },

    /** Choose the nearest block to the dog and create it. X distances less than
     *  8 and Y distances less than 6 count as 0. */
    makeNearestBlock: function(playerX, playerY, level) {
        var x, y, cX, cY, chunk, cXOff, cYOff, dX, dY;
        var closestDist = 1000;
        var xClosest = -1;
        var yClosest = -1;

        for (var xOff = -15; xOff < 15; xOff++) {
            for (var yOff = -12; yOff < 12; yOff++) {
                if (Math.abs(xOff) <= 8 && Math.abs(yOff) <= 6) continue;
                x = playerX + xOff;
                y = playerY + yOff;
                cX = Math.floor(x / 16.0);
                cY = Math.floor(y / 16.0);

                if (!level.inBounds(x, y)
                        || level.getChunk(cX, cY) == null
                        || level.getChunk(cX, cY).isBlockArray == null) {
                    continue;
                }

                chunk = level.getChunk(cX, cY);
                cXOff = x % 16;
                cYOff = y % 16;

                dX = Math.max(0, Math.abs(xOff) - 8);
                dY = Math.max(0, Math.abs(yOff) - 6);

                if (chunk.contents[cYOff][cXOff] == null
                        && dX + dY < closestDist) {
                    closestDist = dX + dY;
                    xClosest = x;
                    yClosest = y;
                }
            }
        }

        if (closestDist != 1000) {
            cX = Math.floor(xClosest / 16.0);
            cY = Math.floor(yClosest / 16.0);
            chunk = level.getChunk(cX, cY);

            this.makeContents(chunk, xClosest, yClosest, level);
        }
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

        [
            [1, 1, 0, 0, 1, 1],
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1],
            [1, 1, 0, 0, 1, 1],
        ],

        [
            [1, 0, 0, 0, 1],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [1, 0, 0, 0, 1],
        ],

        [
            [1, 0, 0, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 0, 0, 1],
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
