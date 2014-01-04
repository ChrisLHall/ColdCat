/** 
 * Meow circle object.
 */
game.Meow = me.ObjectEntity.extend({	
    init: function(x, y, level) {
        var settings = {};
        settings.image = me.loader.getImage("meowyell");
        settings.spritewidth = 24;
        settings.spriteheight = 24;
        this.parent(x, y, settings);

        this.renderable.addAnimation("0", [0]);
        this.renderable.addAnimation("1", [1]);
        this.renderable.addAnimation("2", [2]);
        this.renderable.setCurrentAnimation(
                Math.floor(3 * Math.random()).toString());

        this.anchorPoint.set(0.5, 0.5);

        this.gravity = 0;
        this.alwaysUpdate = true;

        this.collidable = false;

        this.level = level;
        this.innerRadius = 1;
        this.startX = x;
        this.startY = y;

        this.ctrX = 144;
        this.ctrY = 108;
        this.leftBound = -136;
        this.rightBound = 136 - 24;
        this.topBound = -100;
        this.bottomBound = 100 - 24;

        this.counter = 30 + 20*Math.random();
	},

	update: function() {
        this.counter--;
        if (this.counter <= 0) {
            me.game.remove(this);
        }
        if (this.level.player != null) {
            this.pos.set(this.startX, this.startY);
            var v = me.game.viewport.pos;
            var p = new me.Vector2d(v.x + this.ctrX, v.y + this.ctrY);
            this.boundOnLeft(p);
            this.boundOnTop(p);
            this.boundOnRight(p);
            this.boundOnBottom(p);
        }
    },

    boundOnLeft: function(playerPos) {
        if (this.pos.x < playerPos.x + this.leftBound) {
            var newX = playerPos.x + this.leftBound;
            var newY = playerPos.y + ((this.pos.y - playerPos.y)
                    / (this.pos.x - playerPos.x) * this.leftBound);
            this.pos.set(newX, newY);
        }
    },

    boundOnRight: function(playerPos) {
        if (this.pos.x > playerPos.x + this.rightBound) {
            var newX = playerPos.x + this.rightBound;
            var newY = playerPos.y + ((this.pos.y - playerPos.y)
                    / (this.pos.x - playerPos.x) * this.rightBound);
            this.pos.set(newX, newY);
        }
    },

    boundOnTop: function(playerPos) {
        if (this.pos.y < playerPos.y + this.topBound) {
            var newX = playerPos.x + ((this.pos.x - playerPos.x)
                    / (this.pos.y - playerPos.y) * this.topBound);
            var newY = playerPos.y + this.topBound;
            this.pos.set(newX, newY);
        }
    },

    boundOnBottom: function(playerPos) {
        if (this.pos.y > playerPos.y + this.bottomBound) {
            var newX = playerPos.x + ((this.pos.x - playerPos.x)
                    / (this.pos.y - playerPos.y) * this.bottomBound);
            var newY = playerPos.y + this.bottomBound;
            this.pos.set(newX, newY);
        }
    }
});
