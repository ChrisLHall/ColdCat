/**
 * Bone object that gives the player bonus time.
 */
game.BoneItem = game.ItemEntity.extend({
    init: function(x, y, level) {

        this.parent(x, y, "bone", level);

        this.renderable.addAnimation("bone", [17]);
        this.renderable.setCurrentAnimation("bone");
    },

    onCollect: function() {
        me.audio.play("bone");
        game.data.timer = Math.min(game.data.timermax,
                game.data.timer + game.data.BIGBONETIME);
    }
});