/**
 * The player. BLOCKX and BLOCKY are the coordinates of the player
 */
game.PlayerEntity = me.ObjectEntity.extend({
    init: function(blockX, blockY, level) {
        var settings = {};
        settings.image = me.loader.getImage("dog");
        settings.spritewidth = 16;
        settings.spriteheight = 16;

        this.parent(blockX * 16, blockY * 16, settings);

        this.anchorPoint.set(0.0, 0.0);

        this.gravity = 0;
        this.alwaysUpdate = true;

        this.collidable = true;

        this.renderable.addAnimation("right_stand", [0, 1, 2, 3]);
        this.renderable.addAnimation("left_stand", [4, 5, 6, 7]);
        this.renderable.addAnimation("up_stand", [8, 9, 10, 11]);
        this.renderable.addAnimation("down_stand", [12, 13, 14, 15]);

        this.renderable.addAnimation("right_walk", [16, 17, 18, 19]);
        this.renderable.addAnimation("left_walk", [20, 21, 22, 23]);
        this.renderable.addAnimation("up_walk", [24, 25, 26, 27]);
        this.renderable.addAnimation("down_walk", [28, 29, 30, 31]);

        this.renderable.addAnimation("right_dig", [32, 33, 34, 35]);
        this.renderable.addAnimation("left_dig", [36, 37, 38, 39]);
        this.renderable.addAnimation("up_dig", [40, 41, 42, 43]);
        this.renderable.addAnimation("down_dig", [44, 45, 46, 47]);
        this.renderable.animationspeed = 100;
        this.renderable.setCurrentAnimation("down_stand");

        this.blockX = blockX;
        this.blockY = blockY;
        this.level = level;

        this.dir = "down";
        this.anim = "down_stand";
        this.moving = false;
        this.motionTimer = 0;
        // function motionFunc(t), where t is the motion timer, which returns
        // a vector (x,y) position. Required if this.moving is true.
        this.motionFunc = null;
        this.diggingPos = null;

        // Making the dig controls
        this.digMode = false;

        this.powerup = null;
        this.powerupDuration = 0;
    },

    update: function() {
        this.parent(true);

        this.doPowerup();
        this.doDigControl();

        this.motionTimer--;
        if (this.motionTimer <= 0) {
            this.motionTimer = 0;
            this.moving = false;
            this.anim = this.dir + "_stand";
            if (this.diggingPos != null) {
                if (!game.data.gotCat) {
                    game.data.timer = Math.max(0, game.data.timer
                            - Math.floor(game.data.DIGCOST
                            * this.getDigCostMod()));
                }
                this.level.digBlock(Math.floor(this.diggingPos.x),
                        Math.floor(this.diggingPos.y));
                this.diggingPos = null;
            }
        }

        if (!this.moving) {
            this.pos.set(this.blockX * 16, this.blockY * 16);

            if (me.input.isKeyPressed("left")) {
                this.dir = "left";
                this.startMovingTo(this.blockX - 1, this.blockY);
            }
            if (me.input.isKeyPressed("right")) {
                this.dir = "right";
                this.startMovingTo(this.blockX + 1, this.blockY);
            }
            if (me.input.isKeyPressed("up")) {
                this.dir = "up";
                this.startMovingTo(this.blockX, this.blockY - 1);
            }
            if (me.input.isKeyPressed("down")) {
                this.dir = "down";
                this.startMovingTo(this.blockX, this.blockY + 1);
            }
        } else {
            this.pos.setV(this.motionFunc(this.motionTimer));
            if (this.diggingPos != null && this.motionTimer % 10 == 0
                    && game.settings.soundOn) {
                me.audio.play("digsound");
            }
        }

        this.level.xView = this.pos.x - 136; // TODO: tweak
        this.level.yView = this.pos.y - 100; // TODO: tweak

        this.level.xView = Math.max(0, Math.min(16 * (this.level.blocksX - 19),
                this.level.xView));
        this.level.yView = Math.max(0, Math.min(16 * (this.level.blocksY - 14),
                this.level.yView));
        me.game.viewport.pos.set(this.level.xView, this.level.yView);

        if (!this.renderable.isCurrentAnimation(this.anim)) {
            this.renderable.setCurrentAnimation(this.anim);
        }
        return true;
    },

    /** Helper function to process the controls for digging. */
    doDigControl: function() {
        this.digMode = me.input.isKeyPressed("action");
    },

    doPowerup: function() {
        if (this.powerup != null) {
            game.data.powerupAnim = this.powerup.frames;
            this.powerupDuration--;
            this.powerup.onUpdate(this, this.level, this.powerupDuration);
            if (this.powerupDuration <= 0) {
                this.powerup.onEnd(this, this.level);
                this.powerup = null;
            } else if (this.powerupDuration <= 120) {
                game.data.powerupBlinking = true;
            } else {
                game.data.powerupBlinking = false;
            }
        } else {
            game.data.powerupAnim = null;
            game.data.powerupBlinking = false;
        }
    },

    getSpeedMod: function() {
        if (this.powerup != null) {
            return this.powerup.speedMod;
        }
        return 1.0;
    },

    getDigSpeedMod: function() {
        if (this.powerup != null) {
            return this.powerup.digSpeedMod;
        }
        return 1.0;
    },

    getDigCostMod: function() {
        if (this.powerup != null) {
            return this.powerup.digCostMod;
        }
        return 1.0;
    },

    startMovingTo: function (blockXEnd, blockYEnd) {
        if (!this.moving && this.level.inBounds(blockXEnd, blockYEnd)) {
            if (!this.level.isSolid(blockXEnd, blockYEnd)) {
                this.anim = this.dir + "_walk";
                this.moving = true;
                this.motionTimer = Math.floor(10.0 / this.getSpeedMod());
                this.motionFunc = this.moveBetweenFunc(this.pos.x, this.pos.y,
                        blockXEnd * 16, blockYEnd * 16, 10);
                this.blockX = blockXEnd;
                this.blockY = blockYEnd;
            } else if (this.digMode) {
                this.anim = this.dir + "_dig";
                this.moving = true;
                this.motionTimer = Math.floor(30.0 / this.getDigSpeedMod());
                this.motionFunc = this.stayStillFunc(this.blockX * 16,
                        this.blockY * 16);
                this.diggingPos = new me.Vector2d(blockXEnd, blockYEnd);
            }
        }
    },

    moveBetweenFunc: function (xStart, yStart, xEnd, yEnd, duration) {
        var deltaX = (xEnd - xStart) / duration;
        var deltaY = (yEnd - yStart) / duration;
        // the T in this function DECREASES to 0.
        var result = function(t) {
            var progress = duration - t;
            return new me.Vector2d(Math.floor(xStart + progress * deltaX),
                Math.floor(yStart + progress * deltaY));
        };
        return result;
    },

    stayStillFunc: function(x, y) {
        return function(t) { return new me.Vector2d(x, y); };
    }
});