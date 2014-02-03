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

        var title1 = "It's Freezing Out There.";
        var title2 = "(Where Is My Cat?)";
        var title1Obj = new game.FancyText.String(32, 12, title1.length,
                "blue");
        var title2Obj = new game.FancyText.String(48, 24, title2.length,
                "red");
        title1Obj.setString(title1);
        title2Obj.setString(title2);

        this.addChild(title1Obj);
        this.addChild(title2Obj);
	}
});

/** 
 * a basic HUD item to display score
 */
game.TitleGfx.Overlay = me.Renderable.extend({	
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
