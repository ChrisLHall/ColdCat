

/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.ObjectContainer.extend({

	init: function() {
		// call the constructor
		this.parent();
		
		// persistent across level change
		this.isPersistent = true;
		
		// non collidable
		this.collidable = false;
		
		// make sure our object is always draw first
		this.z = Infinity;

        this.autoSort = false;

		// give a name
		this.name = "HUD";
		this.addChild(new game.HUD.BigTimeBone(316, 32, 0));
        for (var yi = 0; yi < 2; yi++) {
            for (var xi = 0; xi < 5; xi++) {
                this.addChild(new game.HUD.SmallTimeBone(294 + 16*xi,
                        68 + 16*yi, ((5*yi)+xi) * 2*game.data.BIGBONETIME));
            }
        }

        var digitsX = 298;
        var digitsY = 100;
        this.addChild(new game.HUD.StopwatchDigit(digitsX, digitsY,
                "#", 60000, 600000));
        this.addChild(new game.HUD.StopwatchDigit(digitsX + 8, digitsY,
                "#", 6000, 60000));
        this.addChild(new game.HUD.StopwatchDigit(digitsX + 16, digitsY,
                "'", 0, 0));
        this.addChild(new game.HUD.StopwatchDigit(digitsX + 24, digitsY,
                "#", 1000, 6000));
        this.addChild(new game.HUD.StopwatchDigit(digitsX + 32, digitsY,
                "#", 100, 1000));
        this.addChild(new game.HUD.StopwatchDigit(digitsX + 40, digitsY,
                ".", 0, 0));
        this.addChild(new game.HUD.StopwatchDigit(digitsX + 48, digitsY,
                "#", 10, 100));
        this.addChild(new game.HUD.StopwatchDigit(digitsX + 56, digitsY,
                "#", 1, 10));
        this.addChild(new game.HUD.StopwatchDigit(digitsX + 64, digitsY,
                "\"", 0, 0));

        this.addChild(new game.HUD.ScoreDigit(300, 132, -1));
        for (var digit = 0; digit < 7; digit++) {
            this.addChild(new game.HUD.ScoreDigit(308 + digit*8, 132,
                    6 - digit));
        }
        this.addChild(new game.HUD.BigCat(338, 168));
        this.addChild(new game.HUD.Powerup(298, 168));
        this.addChild(new game.HUD.Overlay());
	}
});

/** 
 * a basic HUD item to display score
 */
game.HUD.Overlay = me.Renderable.extend({	
    init: function() {
		// call the parent constructor 
		// (size does not matter here)
		this.parent(new me.Vector2d(0, 0), 10, 10); 

		// make sure we use screen coordinates
		this.floating = true;

        this.backImage = me.loader.getImage("overlay");
	},

	/**
	 * draw the overlay
	 */
	draw : function (context) {
		context.drawImage(this.backImage, 0, 0);
	}
});

/** 
 * The small time bone.
 */
game.HUD.SmallTimeBone = me.AnimationSheet.extend({	
	/** 
	 * constructor
	 */
	init: function(x, y, startTimeSteps) {
		this.parent(x, y, me.loader.getImage("timebone"), 12, 12);

        this.addAnimation("empty", [0]);
        this.addAnimation("half", [1]);
        this.addAnimation("full", [2]);
        this.addAnimation("unavailable", [3]);
        this.setCurrentAnimation("empty");
		
		// local copy of the global game timer
		this.timer = -1;
        this.timermax = -1;

		// make sure we use screen coordinates
		this.floating = true;

        this.startTimeSteps = startTimeSteps;
	},

	/**
	 * update function
	 */
	update : function () {
		// we don't do anything fancy here, so just
		// return true if the score has been updated
		if (this.timer !== game.data.timer
                || this.timermax !== game.data.timermax) {	
			this.timer = game.data.timer;
            this.timermax = game.data.timermax;
            if (this.timermax - game.data.BIGBONETIME <= this.startTimeSteps) {
                this.setCurrentAnimation("unavailable");
            } else if (this.timer >= this.startTimeSteps
                    + 2*game.data.BIGBONETIME) {
                this.setCurrentAnimation("full");
            } else if (this.timer >= this.startTimeSteps
                    + game.data.BIGBONETIME) {
                this.setCurrentAnimation("half");
            } else {
                this.setCurrentAnimation("empty");
            }
			return true;
		}
		return false;
	},
});

/** 
 * The BIG time bone, counting down every 8 seconds.
 */
game.HUD.BigTimeBone = me.AnimationSheet.extend({	
	/** 
	 * constructor
	 */
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("bigtimebone"), 32, 32);

        this.addAnimation("7", [0]);
        this.addAnimation("6", [1]);
        this.addAnimation("5", [2]);
        this.addAnimation("4", [3]);
        this.addAnimation("3", [4]);
        this.addAnimation("2", [5]);
        this.addAnimation("1", [6]);
        this.addAnimation("0", [7]);
        this.addAnimation("gone", [8]);
        this.setCurrentAnimation("7");
		
		// local copy of the global game timer
		this.timer = -1;

		// make sure we use screen coordinates
		this.floating = true;
	},

	/**
	 * update function
	 */
	update : function () {
		// we don't do anything fancy here, so just
		// return true if the score has been updated
		if (this.timer !== game.data.timer) {	
			this.timer = game.data.timer;
            if (this.timer > 0) {
                var frame = Math.floor(
                        ((this.timer / game.data.BIGBONETIME) % 1) * 8);
                this.setCurrentAnimation(frame.toString());
            } else {
                this.setCurrentAnimation("gone");
            }
			return true;
		}
		return false;
	},
});


/** 
 * Indicator that you got the cat.
 */
game.HUD.BigCat = me.AnimationSheet.extend({	
	/** 
	 * constructor
	 */
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("bigcat"), 32, 32);

        this.addAnimation("yes", [0]);
        this.addAnimation("close", [1]);
        this.addAnimation("no", [2]);
        this.setCurrentAnimation("no");
		
		// local copy of the global game timer
        this.found = false;

        this.blinkOn = false;
        this.blinkCount = 30;

		// make sure we use screen coordinates
		this.floating = true;
	},

	/**
	 * update function
	 */
	update : function () {
		// we don't do anything fancy here, so just
		// return true if the score has been updated
        if (!this.found) {
            if (game.data.gotCat == true) {
                this.found = true;
                this.setCurrentAnimation("yes");
                return true;
            } else if (game.data.closeToCat) {
                this.blinkCount--;
                if (this.blinkCount == 0) {
                    if (this.blinkOn) {
                        this.setCurrentAnimation("no");
                    } else {
                        this.setCurrentAnimation("close");
                    }
                    this.blinkOn = !this.blinkOn;
                    this.blinkCount = 30;
                }
            } else {
                this.setCurrentAnimation("no");
            }
        } else {
            this.setCurrentAnimation("yes");
        }
	},
});

/** 
 * Indicator of what powerup you have.
 */
game.HUD.Powerup = me.AnimationSheet.extend({	
	/** 
	 * constructor
	 */
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("tiles"), 16, 16);
        this.resize(2.0);
        this.pos.set(x + 8, y + 8);

        this.addAnimation("none", [9]);
        this.setCurrentAnimation("none");
		
		// local copy of the global game timer
        this.powerupAnim = null;
        this.powerupBlinking = false;
        this.blinkCounter = 0;

		// make sure we use screen coordinates
		this.floating = true;
	},

	/**
	 * update function
	 */
	update : function () {
        this.powerupAnim = game.data.powerupAnim;
        this.powerupBlinking = game.data.powerupBlinking;
        var blinkOn = true;
        if (this.powerupBlinking) {
            this.blinkCounter++;
            if ((this.blinkCounter % 30) >= 15) {
                blinkOn = false;
            }
        } else {
            this.blinkCounter = 0;
        }

        if (this.powerupAnim != null && blinkOn) {
            this.addAnimation("power", this.powerupAnim);
            this.setCurrentAnimation("power");
        } else {
            this.setCurrentAnimation("none");
        }
	},
});

/** 
 * A single digit of score.
 */
game.HUD.ScoreDigit = me.AnimationSheet.extend({	
	/** 
	 * X and Y specify the position. Index determines what power of 10 to show
     * from the score. (Index = 5 -> show the 100000's place of the score)
	 */
	init: function(x, y, index) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("moneyfont"), 8, 8);

        this.addAnimation("0", [0]);
        this.addAnimation("1", [1]);
        this.addAnimation("2", [2]);
        this.addAnimation("3", [3]);
        this.addAnimation("4", [4]);
        this.addAnimation("5", [5]);
        this.addAnimation("6", [6]);
        this.addAnimation("7", [7]);
        this.addAnimation("8", [8]);
        this.addAnimation("9", [9]);
        this.addAnimation("dollar", [10]);
        this.addAnimation("empty", [11]);
        this.setCurrentAnimation("dollar");
		
		// local copy of the global game score
		this.score = -1;
        this.index = index;
        if (index == -1) {
            this.powerOfTen = 0;
        } else {
            this.powerOfTen = Math.pow(10, index);
        }

		// make sure we use screen coordinates
		this.floating = true;
	},

	/**
	 * update function
	 */
	update : function () {
        if (this.index == -1) {
            // The animation should already be "dollar"
            return false;
        }
		if (this.score !== game.data.score) {	
			this.score = game.data.score;
            var baseScore = this.score % (this.powerOfTen * 10);
            var count = 0;
            while (baseScore >= this.powerOfTen) {
                baseScore -= this.powerOfTen;
                count++;
            }
            if (count < 10) {
                this.setCurrentAnimation(count.toString());
            }
			return true;
		}
		return false;
	},
});

/** 
 * A spinning stopwatch.
 */
game.HUD.Stopwatch = me.AnimationSheet.extend({	
	/** 
	 * constructor
	 */
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("stopwatch"), 12, 16);

        this.addAnimation("spin", [0, 1, 2, 3, 4, 5, 6, 7]);
        this.addAnimation("stop", [0]);
        this.setCurrentAnimation("spin");
		
		// local copy of the global game timer
		this.stopped = false;

		// make sure we use screen coordinates
		this.floating = true;
	},

	/**
	 * update function
	 */
	update : function () {
		// we don't do anything fancy here, so just
		// return true if the score has been updated
		if (!this.stopped && (game.data.gotCat || game.data.playerLost)) {	
			this.stopped = true;
            this.setCurrentAnimation("stop");
			return true;
		}
		return false;
	}
});

/** 
 * A single digit of the up-counting timer.
 */
game.HUD.StopwatchDigit = me.AnimationSheet.extend({	
	/** 
	 * X and Y specify the position. Unit is the unit by which this counter
     * counts. If type is any of "'. then the character will be directly shown.
     * If it is #, then a digit will be shown. MODULO specifies what to divide
     * the 100th-seconds count by before counting up the digit.
	 */
	init: function(x, y, type, unit, modulo) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("stopwatchfont"), 8, 8);

        this.addAnimation("0", [0]);
        this.addAnimation("1", [1]);
        this.addAnimation("2", [2]);
        this.addAnimation("3", [3]);
        this.addAnimation("4", [4]);
        this.addAnimation("5", [5]);
        this.addAnimation("6", [6]);
        this.addAnimation("7", [7]);
        this.addAnimation("8", [8]);
        this.addAnimation("9", [9]);
        this.addAnimation("\'", [10]);
        this.addAnimation("\"", [11]);
        this.addAnimation(".", [12]);
        this.addAnimation("empty", [13]);
        this.setCurrentAnimation("empty");
		
		// local copy of the global game timeTaken, except in hundredths of a
        // second.
		this.time = -1;
        this.unit = unit;
        this.modulo = modulo;
        if (type == "#") {
            this.isNumber = true;
        } else {
            this.isNumber = false;
            this.setCurrentAnimation(type);
        }

		// make sure we use screen coordinates
		this.floating = true;
	},

	/**
	 * update function
	 */
	update : function () {
		if (this.isNumber && this.time !== game.data.timeTaken) {	
			this.time = game.data.timeTaken;
            var centiseconds = Math.floor(this.time * 100.0 / 60.0);
            var baseTime = centiseconds % this.modulo;
            var count = 0;
            while (baseTime >= this.unit) {
                baseTime -= this.unit;
                count++;
            }
            if (count < 10) {
                this.setCurrentAnimation(count.toString());
            }
			return true;
		}
		return false;
	}
});
