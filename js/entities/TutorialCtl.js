/** Controller object for the tutorial. */
game.TutorialCtl = me.AnimationSheet.extend({
    /** PAGES is the number of pages in the tutorial image (downward). */
	init: function(pages) {
		this.pages = pages;
		// call the parent constructor 
		// (size does not matter here)
		this.parent(0, 0, me.loader.getImage("tutorial"),
                384*this.pages, 216);

        this.addAnimation("page", [0]);
        this.setCurrentAnimation("page");

		this.alwaysUpdate = true;
		this.floating = true;

        this.pageIndex = 0;

        this.isKeyDown = {
            left: false,
            right: false,
            action: false,
        };
	},

    draw: function(context) {
        console.log("BLAH DRAWIN");
        this.parent(context);
    },

    update: function() {
        this.parent();
        if (me.input.isKeyPressed("exit")) {
            me.state.change(me.state.MENU);
        }
        if (me.input.isKeyPressed("left")) {
            if (!this.isKeyDown.left) {
                this.pressLeft();
            }
            this.isKeyDown.left = true;
        } else {
            this.isKeyDown.left = false;
        }
        if (me.input.isKeyPressed("right")) {
            if (!this.isKeyDown.right) {
                this.pressRightOrAction();
            }
            this.isKeyDown.right = true;
        } else {
            this.isKeyDown.right = false;
        }
        if (me.input.isKeyPressed("action")) {
            if (!this.isKeyDown.action) {
                this.pressRightOrAction();
            }
            this.isKeyDown.action = true;
        } else {
            this.isKeyDown.action = false;
        }

        var xTarg = -384*this.pageIndex;
        console.log(xTarg.toString() + " : " + this.pos.x.toString());
        //this.pos.x = xTarg;
        if (this.pos.x < xTarg - 16) {
            this.pos.x += 16;
        } else if (this.pos.x > xTarg + 16) {
            this.pos.x -= 16;
        } else {
            this.pos.x = xTarg;
        }

        return true;
    },

    pressRightOrAction: function() {
        this.pageIndex++;
        if (this.pageIndex == this.pages) {
            this.pageIndex = this.pages - 1;
            me.state.change(me.state.PLAY);
        }
    },

    pressLeft: function() {
        if (this.pageIndex > 0) {
            this.pageIndex--;
        }
    },
});