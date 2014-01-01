/**
 * Item object. Used for carrots and the cat and stuff.
 */
game.ItemEntity = me.ObjectEntity.extend({
    init: function(x, y, type, level) {
        var settings = {};
        settings.image = me.loader.getImage("tiles");
        settings.spritewidth = 16;
        settings.spriteheight = 16;

        this.parent(x, y, settings);

        this.anchorPoint.set(0.0, 0.0);

        this.gravity = 0;
        this.alwaysUpdate = true;

        this.collidable = true;
        this.collisionBox.adjustSize(4, 8, 4, 8);

        this.renderable.addAnimation("unknown", [5]);
        this.renderable.setCurrentAnimation("unknown");

        this.type = type;
        this.level = level;
        this.collected = false;
        this.collectedTimer = 0;
    },

    update: function() {
        if (!this.collected) {
            if (this.level.player != null && this.collides(this.level.player)) {
                this.collected = true;
                this.onCollect();
            }
        } else {
            this.collectedTimer += 1;
            if (this.collectedTimer < 15) {
                this.pos.set(this.pos.x, this.pos.y
                        - (4.0 / this.collectedTimer));
            } else if (this.collectedTimer >= 20) {
                me.game.remove(this);
            }
        }
    },

    onCollect: function() {
        // do nothing this time!
    },

    collides: function(otherObj) {
        return this.collisionBox.overlaps(otherObj.collisionBox);
    }
});