

/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.ObjectContainer.extend({

	init: function() {
		// call the constructor
		this.parent();
		
		// non collidable
		this.collidable = false;

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

        this.addChild(new game.HUD.SuccessFailure(144, 108));

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

/** 
 * The on-screen indicator that says "SUCCESS!" and "FAILURE".
 */
game.HUD.SuccessFailure = me.AnimationSheet.extend({
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("successfail"), 96, 16);

        this.addAnimation("success", [0]);
        this.addAnimation("failure", [1]);
        this.addAnimation("empty", [2]);
        this.setCurrentAnimation("empty");

        this.resize(3.0);
        this.pos.set(x - 48, y - 8);
		
		// local copy of the global game timeTaken, except in hundredths of a
        // second.
		this.gameOver = false;
        this.didWin = false;
        this.deployedText = false;

        this.gameOverCounter = 0;

		// make sure we use screen coordinates
		this.floating = true;
	},

	/**
	 * update function
	 */
	update : function () {
		if (!this.gameOver && (game.data.gotCat || game.data.playerLost)) {	
			this.gameOver = true;
            if (game.data.gotCat) {
                this.didWin = true;
                this.setCurrentAnimation("success");
            } else {
                this.didWin = false;
                this.setCurrentAnimation("failure");
            }
			return true;
		} else if (this.gameOver) {
            this.gameOverCounter++;
            if (this.gameOverCounter >= 60) {
                if (this.didWin && !this.deployedText) {
                    this.deployedText = true;
                    me.state.current().hud.addChild(
                            new game.HUD.NewHighscore(32, 144));
                } else if (!this.didWin && !this.deployedText) {
                    this.deployedText = true;
                    var str = "Press any key to exit.";
                    var exittext = new game.FancyText.String(32, 144,
                            str.length, "red");
                    exittext.setString(str);
                    me.state.current().hud.addChild(exittext);
                } else if (me.input.isKeyPressed("left")
                        || me.input.isKeyPressed("right")
                        || me.input.isKeyPressed("up")
                        || me.input.isKeyPressed("down")
                        || me.input.isKeyPressed("action")) {
                    me.state.change(me.state.MENU);
                }
            }
            return true;
        }
		return false;
	}
});

/** 
 * Object that allows the user to input initials for a high score.
 */
game.HUD.NewHighscore = me.AnimationSheet.extend({
	init: function(x, y) {
		this.parent(x, y, me.loader.getImage("initialarrows"), 8, 24);

		// make sure we use screen coordinates
		this.floating = true;
		
		this.startX = x;
        this.startY = y;
        var hsi = game.data.highScoreInitials;
        var Acode = "A".charCodeAt(0);
		this.initialCodes = [hsi.charCodeAt(0) - Acode,
                hsi.charCodeAt(1) - Acode, hsi.charCodeAt(2) - Acode];

        this.cursorPos = 0;
        this.lastKeyPressed = "none";
        this.keyPressCounter = 0;

        var str = "New record! Initials:";
        var mainText = new game.FancyText.String(x, y - 8, str.length,
                "yellow");
        mainText.setString(str);
        me.state.current().hud.addChild(mainText);

        this.initialsText = new game.FancyText.String(x, y + 8, 3, "green");
        this.initialsText.setString(hsi);
        me.state.current().hud.addChild(this.initialsText);
	},

	/**
	 * update function
	 */
	update : function () {
        var key = "none";
        var doAction = false;
        if (me.input.isKeyPressed("left")) { key = "left"; }
        if (me.input.isKeyPressed("right")) { key = "right"; }
        if (me.input.isKeyPressed("up")) { key = "up"; }
        if (me.input.isKeyPressed("down")) { key = "down"; }
        if (me.input.isKeyPressed("action")) { key = "action"; }

        if (key == this.lastKeyPressed) {
            this.keyPressCounter++;
            if ((this.keyPressCounter == 1) || (this.keyPressCounter > 30
                    && this.keyPressCounter % 8 == 4 && key != "action")) {
                doAction = true;
            }
        } else {
            this.keyPressCounter = 0;
            this.lastKeyPressed = key;
        }

		if (!doAction) { return false; }

        if (key == "left") {
            this.cursorPos--;
            if (this.cursorPos < 0) { this.cursorPos = 2; }
            this.pos.set(this.startX + 8*this.cursorPos, this.startY);
        } else if (key == "right") {
            this.cursorPos++;
            if (this.cursorPos > 2) { this.cursorPos = 0; }
            this.pos.set(this.startX + 8*this.cursorPos, this.startY);
        } else if (key == "up") {
            var letterCode = this.initialCodes[this.cursorPos];
            letterCode++;
            if (letterCode > 25) { letterCode = 0; }
            this.initialCodes[this.cursorPos] = letterCode;
            this.initialsText.setString(this.getInitialsString());
        } else if (key == "down") {
            var letterCode = this.initialCodes[this.cursorPos];
            letterCode--;
            if (letterCode < 0) { letterCode = 25; }
            this.initialCodes[this.cursorPos] = letterCode;
            this.initialsText.setString(this.getInitialsString());
        } else if (key == "action") {
            if (this.cursorPos < 2) {
                this.cursorPos++;
                this.pos.set(this.startX + 8*this.cursorPos, this.startY);
            } else {
                // TODO APPLY HIGHSCORE TO THE TABLE SOMEHOW
                me.state.change(me.state.MENU);
            }
        }

		return true;
	},

    getInitialsString: function() {
        var Acode = "A".charCodeAt(0);
        var str = "";
        str += String.fromCharCode(Acode + this.initialCodes[0]);
        str += String.fromCharCode(Acode + this.initialCodes[1]);
        str += String.fromCharCode(Acode + this.initialCodes[2]);
        return str;
    },
});

