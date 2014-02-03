
/* Game namespace */
var game = {

	// an object where to store game information
	data : {
        // constants, DO NOT CHANGE THESE
        BIGBONETIME: 480,
        DIGCOST: 15,
		// score
		score : -1,
        timer : -1,
        timermax : -1,
        timeTaken : -1,
        gotCat : false,
        closeToCat : false,
        playerLost : false,
        highScoreInitials : "AAA",
        powerupAnim : null,
        powerupBlinking : false,

        reset: function() {
            this.score = 0;
            this.timer = 6000;
            this.timermax = 6000;
            this.timeTaken = 0;
            this.gotCat = false;
            this.closeToCat = false;
            this.playerLost = false;
            this.powerupAnim = null;
            this.powerupBlinking = false;
        }
	},
	
	
	// Run on page load.
	"onload" : function () {
	// Initialize the video.
	if (!me.video.init("screen", 384, 216, true, 'auto')) {
		alert("Your browser does not support HTML5 canvas.");
		return;
	}

	// add "#debug" to the URL to enable the debug Panel
	if (document.location.hash === "#debug") {
		window.onReady(function () {
			me.plugin.register.defer(debugPanel, "debug");
		});
	}

	// Initialize the audio.
	me.audio.init("mp3,ogg");

	// Set a callback to run when loading is complete.
	me.loader.onload = this.loaded.bind(this);

	// Load the resources.
	me.loader.preload(game.resources);

	// Initialize melonJS and display a loading screen.
	me.state.change(me.state.LOADING);
},

	// Run on game resources loaded.
	"loaded" : function () {
        /* Load local highscore data. */
        var scoreRecords = {"small": [], "medium": [], "large": []};
        var timeRecords = {"small": [], "medium": [], "large": []};
        for (var i = 0; i < 10; i++) {
            scoreRecords[i] = {initials: "AAA", score: 0, time: 359999};
            timeRecords[i] = {initials: "AAA", score: 0, time: 359999};
        }
        me.save.complexObject = {bestScores: scoreRecords,
                bestTimes: timeRecords};

		me.state.set(me.state.MENU, new game.TitleScreen());
		me.state.set(me.state.PLAY, new game.PlayScreen());

		// Start the game.
		me.state.change(me.state.MENU);
	}
};
