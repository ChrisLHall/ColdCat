/**
 * Container and controllers for the highscore screen.
 */

game.HighScoreCtl = game.HighScoreCtl || {};


game.HighScoreCtl.Container = me.ObjectContainer.extend({

	init: function() {
		// call the constructor
		this.parent();
		
		// non collidable
		this.collidable = false;

        this.autoSort = false;

        this.addChild(new game.HighScoreCtl.Title(130, 8));
        this.addChild(new game.HighScoreCtl.ScoresList(88, 32));
        this.addChild(new game.HighScoreCtl.Bg());
	}
});

/** The background item. */
game.HighScoreCtl.Bg = me.Renderable.extend({	
    init: function() {
		// call the parent constructor 
		// (size does not matter here)
		this.parent(new me.Vector2d(10, 10), 10, 10); 

		// make sure we use screen coordinates
		this.floating = true;
        this.alwaysUpdate = true;

        this.backImage = me.loader.getImage("highscorebg");
        this.x = 0;
        this.y = 0;
	},

	/**
	 * draw the overlay
	 */
	draw : function (context) {
        this.parent(context);
		context.drawImage(this.backImage, this.x - 16, this.y - 16);
	},

    update: function() {
        this.parent();

        this.y += 1;
        while (this.x >= 16) { this.x -= 16; }
        while (this.y >= 16) { this.y -= 16; }

        if (me.input.isKeyPressed("exit") || me.input.isKeyPressed("action")) {
            me.state.change(me.state.MENU);
        }
        return true;
    },
});

/** Title graphic for the highscore page. */
game.HighScoreCtl.Title = me.Renderable.extend({	
    init: function(x, y) {
		// call the parent constructor 
		// (size does not matter here)
		this.parent(new me.Vector2d(x, y), 10, 10); 

		// make sure we use screen coordinates
		this.floating = true;

        this.img = me.loader.getImage("highscoretitle");
	},

	/**
	 * draw the overlay
	 */
	draw : function (context) {
		context.drawImage(this.img, this.pos.x, this.pos.y);
	},

    update: function() {
        this.parent();
    },
});

/** 
 * A scores list, either for best scores or best times.
 */
game.HighScoreCtl.ScoresList = me.Renderable.extend({
    /** SCORESORTIMES should be "scores" or "times", and determines where to
     *  source data from. */
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(new me.Vector2d(x, y), 10, 10);

		// make sure we use screen coordinates
		this.floating = true;
        this.alwaysUpdate = true;

        this.items = [];

        this.addText("Best Scores:", "yellow");
        for (var i = 0; i < 6; i++) {
            var override = null;
            if (i == game.data.highlightScoreIndex) {
                override = "green";
            }
            this.addScoreItem(i + 1, game.settings.bestScores[i], override);
        }
        this.addText("", "blue");
        this.addText("Best Times:", "green");
        for (var i = 0; i < 6; i++) {
            var override = null
            if (i == game.data.highlightTimeIndex) {
                override = "green";
            }
            this.addScoreItem(i + 1, game.settings.bestTimes[i], override);
        }
    },

    draw: function(context) {},

    /** Adds a menu item with text STR and color COLOR. */
    addText: function(str, color) {
        var newIndex = this.items.length;
        var textObj = new game.FancyText.String(this.pos.x,
                this.pos.y + 12*newIndex, str.length, color);
        textObj.setString(str);
        this.items[newIndex] = [textObj];
        me.game.add(textObj, 100);
    },

    /** Adds an item to the list corresponding to a highscore entry. INDEX is
     *  the number of the score to add. SCOREOBJ is the obj with properties
     *  "score", "time", and "initials". OVERRIDECOLOR will color the whole
     *  row one color, if it is set. */
    addScoreItem: function(index, scoreObj, overrideColor) {
        var newIndex = this.items.length;

        var indText = new game.FancyText.String(this.pos.x,
                this.pos.y + 12*newIndex, 3, overrideColor || "blue");
        var str = index.toString() + ".";
        if (index < 10) { str = " " + str; }
        indText.setString(str);

        var initialsText = new game.FancyText.String(this.pos.x + 28,
                this.pos.y + 12*newIndex, 3, overrideColor || "red");
        str = scoreObj.initials;
        initialsText.setString(str);

        var scoreText = new game.FancyText.String(this.pos.x + 56,
                this.pos.y + 12*newIndex, 8, "yellow");
        str = this.scoreToStr(scoreObj.score);
        scoreText.setString(str);

        var timeText = new game.FancyText.String(this.pos.x + 124,
                this.pos.y + 12*newIndex, 9, "green");
        str = this.stepsToTimeStr(scoreObj.time);
        timeText.setString(str);

        this.items[newIndex] = [indText, scoreText, timeText, initialsText];
        me.game.add(indText, 100);
        me.game.add(scoreText, 100);
        me.game.add(timeText, 100);
        me.game.add(initialsText, 100);
    },

    /** Return a stringified score. */
    scoreToStr: function(score) {
        var str = "$" + score.toString();
        while (str.length < 8) str = " " + str;
        return str;
    },

    /** Turns STEPS in 60ths of a second into a proper --'--.--" readout. */
    stepsToTimeStr: function(steps) {
        var centiseconds = Math.floor(steps * 100.0 / 60.0);
        var str = "";

        // 10 minutes at a time
        var digit = 0;
        while (centiseconds >= 60000) {
            centiseconds -= 60000;
            digit += 1;
        }
        str += digit.toString();

        // 1 minute at a time
        digit = 0;
        while (centiseconds >= 6000) {
            centiseconds -= 6000;
            digit += 1;
        }
        str += digit.toString() + "'";

        // 10 seconds at a time
        digit = 0;
        while (centiseconds >= 1000) {
            centiseconds -= 1000;
            digit += 1;
        }
        str += digit.toString();

        // 1 second at a time
        digit = 0;
        while (centiseconds >= 100) {
            centiseconds -= 100;
            digit += 1;
        }
        str += digit.toString() + ".";

        // 10 centis at a time
        digit = 0;
        while (centiseconds >= 10) {
            centiseconds -= 10;
            digit += 1;
        }
        str += digit.toString();

        // 1 centi at a time
        digit = 0;
        while (centiseconds >= 1) {
            centiseconds -= 1;
            digit += 1;
        }
        str += digit.toString() + "\"";
        return str;
    },
});
