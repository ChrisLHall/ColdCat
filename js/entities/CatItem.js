/**
 * The object that the player must find in the first place!
 */
game.CatItem = game.ItemEntity.extend({
    init: function(x, y, level) {

        this.parent(x, y, "cat", level);

        this.renderable.addAnimation("cat", [16]);
        this.renderable.setCurrentAnimation("cat");
    },

    onCollect: function() {
        game.data.gotCat = true;
    }
});