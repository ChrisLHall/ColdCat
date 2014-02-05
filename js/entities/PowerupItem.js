/**
 * Item that holds player powerups.
 */
game.PowerupItem = game.ItemEntity.extend({
    init: function(x, y, level, powerupType) {

        this.parent(x, y, "powerup", level);

        if (!(powerupType in game.Powerup.types)) {
            powerupType = "none";
        }

        this.renderable.addAnimation(powerupType,
                game.Powerup.types[powerupType].frames);
        this.renderable.setCurrentAnimation(powerupType);

        this.powerupType = powerupType;
    },

    onCollect: function() {
        var p = this.level.player;
        if (p != null) {
            if (p.powerup != null) {
                p.powerup.onEnd(p, this.level);
            }

            var newPowerup = game.Powerup.types[this.powerupType];
            p.powerup = newPowerup;
            p.powerupDuration = newPowerup.duration;
            p.powerup.onStart(p, this.level);
        }
    }
});

game.Powerup = game.Powerup || {};

game.Powerup.FireFx = me.AnimationSheet.extend({
	init: function(x, y, life) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("tiles"), 16, 16);

        this.addAnimation("fire0", [15, 25, 55, 65, 15, 35, 45]);
        this.addAnimation("fire1", [65, 55, 35, 15, 25, 65, 55, 15]);
        this.addAnimation("fire2", [45, 55, 35, 15, 45, 35, 65, 25, 15]);
        this.setCurrentAnimation("fire"
                + Math.floor(2 * Math.random()).toString());

        this.lifeCounter = life;
        this.alwaysUpdate = true;
    },

	/**
	 * update function
	 */
	update : function () {
        this.parent();
        this.lifeCounter--;
        if (this.lifeCounter <= 0) {
            me.game.remove(this);
        }
		return true;
	}
});

game.Powerup.DustFx = me.AnimationSheet.extend({
    /** Create a dust effect at X, Y. GOINGRIGHT, when true, means this entity
     *  is moving right; otherwise it is moving left. */
	init: function(x, y, goingRight) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("tiles"), 16, 16);

        this.addAnimation("dust0", [14]);
        this.addAnimation("dust1", [24]);
        this.addAnimation("dust2", [34]);
        this.setCurrentAnimation("dust0");

        this.right = goingRight;
        this.counter = 0;
        this.lifeStage = 0;
        this.alwaysUpdate = true;
    },

	/**
	 * update function
	 */
	update : function () {
        this.parent();
        this.counter++;
        if (this.counter % 5 == 0) {
            if (this.right) {
                this.pos.x += 1;
            } else {
                this.pos.x -= 1;
            }
        }
        if (this.counter % 10 == 0) {
            this.lifeStage++;
            if (this.lifeStage <= 2) {
                this.setCurrentAnimation("dust" + this.lifeStage.toString());
            } else {
                me.game.remove(this);
            }
        }
		return true;
	}
});

game.Powerup.types = {
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
            if (timeLeft % 24 == 0) {
                var fire = new game.Powerup.FireFx(player.pos.x - 16,
                    player.pos.y - 16, 30 + Math.floor(30*Math.random()));
                me.game.add(fire, 8);
            } else if (timeLeft % 24 == 6) {
                var fire = new game.Powerup.FireFx(player.pos.x + 16,
                    player.pos.y - 16, 30 + Math.floor(30*Math.random()));
                me.game.add(fire, 8);
            } else if (timeLeft % 24 == 12) {
                var fire = new game.Powerup.FireFx(player.pos.x + 16,
                    player.pos.y + 16, 30 + Math.floor(30*Math.random()));
                me.game.add(fire, 8);
            } else if (timeLeft % 24 == 18) {
                var fire = new game.Powerup.FireFx(player.pos.x - 16,
                    player.pos.y + 16, 30 + Math.floor(30*Math.random()));
                me.game.add(fire, 8);
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
            if (timeLeft % 20 == 0) {
                var dust1 = new game.Powerup.DustFx(player.pos.x - 8,
                    player.pos.y, false);
                var dust2 = new game.Powerup.DustFx(player.pos.x + 8,
                    player.pos.y, true);
                me.game.add(dust1, 9);
                me.game.add(dust2, 9);
            }
        },
        onEnd: function(player, level) {
        }
    }
};