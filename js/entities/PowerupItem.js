/**
 * Item that holds player powerups.
 */
game.PowerupItem = game.ItemEntity.extend({
    init: function(x, y, level, powerupType) {

        this.parent(x, y, "powerup", level);

        if (!(powerupType in game.PowerupItem.types)) {
            powerupType = "none";
        }

        this.renderable.addAnimation(powerupType,
                game.PowerupItem.types[powerupType].frames);
        this.renderable.setCurrentAnimation(powerupType);

        this.powerupType = powerupType;
    },

    onCollect: function() {
        var p = this.level.player;
        if (p != null) {
            if (p.powerup != null) {
                p.powerup.onEnd(p, this.level);
            }

            var newPowerup = game.PowerupItem.types[this.powerupType];
            p.powerup = newPowerup;
            p.powerupDuration = newPowerup.duration;
            p.powerup.onStart(p, this.level);
        }
    }
});

game.PowerupItem.types = {
    "none": {
        type: "none",
        frames: [5],
        duration: 30,
        speedMod: 1.0,
        digSpeedMod: 1.0,
        digCostMod: 1.0,
        onStart: function(player, level) {
        },
        onUpdate: function(player, level, timeLeft) {
        },
        onEnd: function(player, level) {
        }
    },

    "sight": {
        type: "sight",
        frames: [27],
        duration: 120,
        speedMod: 1.0,
        digSpeedMod: 1.0,
        digCostMod: 1.0,
        onStart: function(player, level) {
        },
        onUpdate: function(player, level, timeLeft) {
            var blockX = Math.floor(player.pos.x / 16.0);
            var blockY = Math.floor(player.pos.y / 16.0);
            for (var xOff = -4; xOff <= 4; xOff++) {
                for (var yOff = -4; yOff <= 4; yOff++) {
                    if (level.inBounds(blockX + xOff, blockY + yOff)) {
                        level.get(blockX + xOff, blockY + yOff).seeThrough
                                = true;
                    }
                }
            }
        },
        onEnd: function(player, level) {
        }
    },

    "flame": {
        type: "flame",
        frames: [37],
        duration: 240,
        speedMod: 1.2,
        digSpeedMod: 1.0,
        digCostMod: 1.0,
        onStart: function(player, level) {
        },
        onUpdate: function(player, level, timeLeft) {
            if (timeLeft % 2 == 0) {
                var blockX = Math.round(player.pos.x / 16);
                var blockY = Math.round(player.pos.y / 16);
                for (var xOff = -1; xOff <= 1; xOff++) {
                    for (var yOff = -1; yOff <= 1; yOff++) {
                        if (level.inBounds(blockX + xOff, blockY + yOff)
                                && level.isSolid(blockX + xOff,
                                blockY + yOff)) {
                            level.digBlock(blockX + xOff, blockY + yOff);
                        }
                    }
                }
            }
        },
        onEnd: function(player, level) {
        }
    },

    "speed": {
        type: "speed",
        frames: [47],
        duration: 360,
        speedMod: 1.5,
        digSpeedMod: 1.5,
        digCostMod: 0.5,
        onStart: function(player, level) {
        },
        onUpdate: function(player, level, timeLeft) {
        },
        onEnd: function(player, level) {
        }
    }
};