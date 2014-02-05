/**
 * Treasure item that gives points to the player
 */
game.TreasureItem = game.ItemEntity.extend({
    init: function(x, y, level, treasureType) {

        this.parent(x, y, "treasure", level);

        if (!(treasureType in game.TreasureItem.types)) {
            treasureType = "unknown";
        }

        this.renderable.addAnimation(treasureType,
                game.TreasureItem.types[treasureType].frames);
        this.renderable.setCurrentAnimation(treasureType);

        this.treasureType = treasureType;
    },

    onCollect: function() {
        me.audio.play("smalltreasure");
        game.data.score += game.TreasureItem.types[this.treasureType].value;
    }
});

game.TreasureItem.types = {
    "unknown": {frames: [5], value: 0},
    "nugget": {frames: [18], value: 200},
    "bar": {frames: [28], value: 1000},
    "ruby": {frames: [38], value: 2500}
};