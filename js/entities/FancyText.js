/** Way to display text in the cool #1GAM font. */

game.FancyText = game.FancyText || {};

game.FancyText.String = me.ObjectContainer.extend({
    /** Create a fancy string at position (x, y) with maximum length MAXLENGTH.
     *  MAXLENGTH is the number of characters that will be created. TYPE can be
     *  one of "red", "blue", "green" or "yellow". */
	init: function(x, y, maxLength, type) {
		// call the constructor
		this.parent();

		// non collidable
		this.collidable = false;

        this.autoSort = false;

        this.length = maxLength;

        this.characters = [];
        for (var i = 0; i < maxLength; i++) {
            this.characters[i] = new game.FancyText.Character(x + 8*i, y, type);
            this.addChild(this.characters[i]);
        }
	},

    moveTo: function(x, y) {
        this.pos.set(x, y);
        for (var i = 0; i < this.length; i++) {
            this.characters[i].pos.set(x + 8*i, y);
        }
    },

    setString: function(str) {
        for (var i = 0; i < this.length; i++) {
            if (i < str.length) {
                this.characters[i].setChar(str[i]);
            } else {
                this.characters[i].setChar(" ");
            }
        }
    },
});

game.FancyText.Character = me.AnimationSheet.extend({
    /** Creates a new fancytext character of type TYPE at position X, Y. */
    init: function(x, y, type) {
        var fontName = "bluefont";
        if (type == "blue") { fontName = "bluefont"; }
        if (type == "red") { fontName = "redfont"; }
        if (type == "yellow") { fontName = "yellowfont"; }
        if (type == "green") { fontName = "greenfont"; }
		this.parent(x, y, me.loader.getImage(fontName), 8, 8);

        this.floating = true;

        this.character = " ";

        var start = " ".charCodeAt(0);
        var end = "~".charCodeAt(0);
        for (var i = start; i <= end; i++) {
            this.addAnimation(String.fromCharCode(i), [i - start]);
        }
        this.setCurrentAnimation(" ");
    },

    setChar: function(c) {
        if (c != this.character) {
            this.character = c;
            this.setCurrentAnimation(c);
        }
    },
});