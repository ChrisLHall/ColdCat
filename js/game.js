
/* Game namespace */
var game = {

	// an object where to store game information
	data : {
        // constants, DO NOT CHANGE THESE
        BIGBONETIME: 480,
        BIGBONEPOINTS: 1000,
        DIGCOST: 5,
		// score
		score : -1,
        timer : -1,
        timermax : -1,
        timeTaken : -1,
        gotCat : false,
        closeToCat : false,
        playerLost : false,
        highScoreInitials : "AAA",
        highlightScoreIndex: -1,
        highlightTimeIndex: -1,
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
            this.highlightScoreIndex = -1;
            this.highlightTimeIndex = -1;
        }
	},

    settings: {
        MAXTIME: 356400,
        DEFAULTINITIALS: "AAA",

        soundOn: true,
        musicOn: true,
        bestScores: [],
        bestTimes: [],

        insertBestScore: function(newScore, newTime, newInitials, position) {
            var newEntry = {
                score: newScore,
                time:newTime,
                initials:newInitials
            };

            for (var i = 5; i >= position; i--) {
                this.bestScores[i + 1] = this.bestScores[i];
            }
            this.bestScores[position] = newEntry;
            this.save();
        },

        insertBestTime: function(newScore, newTime, newInitials, position) {
            var newEntry = {
                score: newScore,
                time:newTime,
                initials:newInitials
            };

            for (var i = 5; i >= position; i--) {
                this.bestTimes[i + 1] = this.bestTimes[i];
            }
            this.bestTimes[position] = newEntry;
            this.save();
        },

        createDefaultScores: function() {
            var scorelist = [];
            for (i = 0; i < 6; i++) {
                scorelist[i] = {
                    score: 0,
                    time: this.MAXTIME, 
                    initials: this.DEFAULTINITIALS,
                };
            }
            return scorelist;
        },

        reset: function() {
            this.bestScores = this.createDefaultScores();
            this.bestTimes = this.createDefaultScores();
        },

        save: function() {
            me.save.bestScores = this.bestScores;
            me.save.bestTimes = this.bestTimes;
            me.save.soundOn = this.soundOn;
            me.save.musicOn = this.musicOn;
        },

        load: function() {
            me.save.add({
                bestScores: this.createDefaultScores(),
                bestTimes: this.createDefaultScores(),
                soundOn: true,
                musicOn: true,
            });
            this.bestScores = me.save.bestScores;
            this.bestTimes = me.save.bestTimes;
            this.soundOn = me.save.soundOn;
            this.musicOn = me.save.musicOn;
        },
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

        me.sys.fps = 30;
    },

	// Run on game resources loaded.
	"loaded" : function () {
        game.settings.load();

		me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.READY, new game.TutorialScreen());
		me.state.set(me.state.PLAY, new game.PlayScreen());
        me.state.set(me.state.SCORE, new game.HighScoreScreen());

		// Start the game.
		me.state.change(me.state.MENU);
	}
};
