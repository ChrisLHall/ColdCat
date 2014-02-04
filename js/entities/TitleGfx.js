/**
 * Container and child items for title screen. Working game title is:
 * "It's Freezing Out There. (Where Is My Cat?)"
 */

game.TitleGfx = game.TitleGfx || {};


game.TitleGfx.Container = me.ObjectContainer.extend({

	init: function() {
		// call the constructor
		this.parent();
		
		// non collidable
		this.collidable = false;

        this.autoSort = false;

        this.addChild(new game.TitleGfx.Dog(206, 134));
        this.addChild(new game.TitleGfx.Menu(16, 96));
        this.addChild(new game.TitleGfx.Bg());
	}
});

/** 
 * a basic HUD item to display score
 */
game.TitleGfx.Bg = me.Renderable.extend({	
    init: function() {
		// call the parent constructor 
		// (size does not matter here)
		this.parent(new me.Vector2d(0, 0), 10, 10); 

		// make sure we use screen coordinates
		this.floating = true;

        this.backImage = me.loader.getImage("menubg");

        this.meowCounter = 60;
	},

	/**
	 * draw the overlay
	 */
	draw : function (context) {
		context.drawImage(this.backImage, 0, 0, 384, 216);
	},

    update: function() {
        this.meowCounter--;
        if (this.meowCounter == 0) {
            me.game.add(new game.TitleGfx.Meow(256, 88), 100);
            this.meowCounter = 180 + Math.floor(60 * Math.random());
        }
    },
});

game.TitleGfx.Dog = me.AnimationSheet.extend({	
	/** 
	 * constructor
	 */
	init: function(x, y) {
		this.parent(x, y, me.loader.getImage("titledog"), 32, 32);

        this.addAnimation("wag", [0, 1, 2, 3]);
        this.addAnimation("bark", [4, 5, 6, 7]);
        this.setCurrentAnimation("wag");

		this.floating = true;

        this.barkTimer = 60;
	},

	update : function () {
        this.parent();

        this.barkTimer--;
        if (this.barkTimer == 0) {
            this.setCurrentAnimation("bark", "wag");
            this.barkTimer = 30 + Math.floor(100 * Math.random());
        }
        return true;
	},
});

/** 
 * Meow speech bubble object for the title screen.
 */
game.TitleGfx.Meow = me.ObjectEntity.extend({	
    init: function(x, y) {
        var settings = {};
        settings.image = me.loader.getImage("meowyell");
        settings.spritewidth = 24;
        settings.spriteheight = 24;
        this.parent(x, y, settings);

        this.renderable.resize(2.0);
        this.pos.set(x + 12, y + 12);

        this.renderable.addAnimation("0", [0]);
        this.renderable.addAnimation("1", [1]);
        this.renderable.addAnimation("2", [2]);
        this.renderable.setCurrentAnimation(
                Math.floor(3 * Math.random()).toString());

        this.gravity = 0;
        this.alwaysUpdate = true;

        this.collidable = false;

        this.counter = 30 + 20*Math.random();
	},

	update: function() {
        this.counter--;
        if (this.counter <= 0) {
            me.game.remove(this);
        }
    },
});

/** 
 * The menu controller and arrow
 */
game.TitleGfx.Menu = me.AnimationSheet.extend({
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(x, y, me.loader.getImage("menuarrow"), 16, 12);

        this.addAnimation("arrow", [0]);
        this.setCurrentAnimation("arrow");

		// make sure we use screen coordinates
		this.floating = true;

        this.menuItems = [];

        this.addMenuItem("New Game", "blue");
        this.addMenuItem("Highscores", "blue");
        // The extra space after 'On' is to fit the string 'Sound Off'
        this.addMenuItem("No sound yet      ", "blue");
        // Likewise, this item has to fit 'Are you sure?'
        this.addMenuItem("Clear Data   ", "red");

        this.areYouSure = false;

        this.menuIndex = 0;

        this.isKeyDown = {
            down: false,
            up: false,
            select: false,
        };
    },

    /** Adds a menu item with text STR and color COLOR. */
    addMenuItem: function(str, color) {
        var newIndex = this.menuItems.length;
        var textObj = new game.FancyText.String(this.pos.x + 24,
                this.pos.y + 2 + 16*newIndex, str.length, color);
        textObj.setString(str);
        this.menuItems[newIndex] = textObj;
        me.game.add(textObj, 100);
    },

    /** Moves the menu cursor by NUMITEMS items, negative or positive. */
    moveMenuCursor: function(numItems) {
        this.menuIndex += numItems;
        while (this.menuIndex < 0) {
            this.menuIndex += this.menuItems.length;
        }
        while (this.menuIndex >= this.menuItems.length) {
            this.menuIndex -= this.menuItems.length;
        }

        this.pos.set(this.menuItems[this.menuIndex].pos.x - 24,
                this.menuItems[this.menuIndex].pos.y - 2);
    },

    /** Do yo thang for selecting a menu item. */
    selectMenuItem: function() {
        if (this.menuIndex == 0) {
            me.state.change(me.state.PLAY);
        } else if (this.menuIndex == 1) {
            me.state.change(me.state.SCORE);
        } else if (this.menuIndex == 2) {
            game.settings.soundOn = !game.settings.soundOn;
            game.settings.save();
        } else if (this.menuIndex == 3) {
            if (!this.areYouSure) {
                this.areYouSure = true;
                this.menuItems[3].setString("Are you sure?");
            } else {
                game.settings.reset();
                game.settings.save();
                me.state.change(me.state.MENU);
            }
        }
    },

	/**
	 * update function: handle key presses and stuff
	 */
	update : function () {
        this.parent();

        if (game.settings.soundOn) {
            this.menuItems[2].setString("No sound yet (On)");
        } else {
            this.menuItems[2].setString("No sound yet (Off)");
        }

        if (me.input.isKeyPressed("up")) {
            if (!this.isKeyDown.up) {
                this.moveMenuCursor(-1);
            }

            this.isKeyDown.up = true;
        } else {
            this.isKeyDown.up = false;
        }
        if (me.input.isKeyPressed("down")) {
            if (!this.isKeyDown.down) {
                this.moveMenuCursor(1);
            }

            this.isKeyDown.down = true;
        } else {
            this.isKeyDown.down = false;
        }
        if (me.input.isKeyPressed("action")) {
            if (!this.isKeyDown.select) {
                this.selectMenuItem();
            }

            this.isKeyDown.select = true;
        } else {
            this.isKeyDown.select = false;
        }
    }
});
