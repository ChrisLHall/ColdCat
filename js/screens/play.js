game.PlayScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {
        me.input.bindKey(me.input.KEY.A, "left", false);
        me.input.bindKey(me.input.KEY.D, "right", false);
        me.input.bindKey(me.input.KEY.W, "up", false);
        me.input.bindKey(me.input.KEY.S, "down", false);
        me.input.bindKey(me.input.KEY.LEFT, "left", false);
        me.input.bindKey(me.input.KEY.RIGHT, "right", false);
        me.input.bindKey(me.input.KEY.UP, "up", false);
        me.input.bindKey(me.input.KEY.DOWN, "down", false);
        me.input.bindKey(me.input.KEY.ENTER, "action", false);
        me.input.bindKey(me.input.KEY.SHIFT, "action", false);
        me.input.bindKey(me.input.KEY.SPACE, "action", false);
        me.input.bindKey(me.input.KEY.ESC, "exit", false);

        if (game.settings.musicOn) {
            me.audio.play("frozensecretkittymusic", false, null, 0.75);
        }
        game.data.reset();
        this.level = new game.BaseLevel(12, 12, 11);
        me.game.add(this.level, 0);

        this.hud = new game.HUD.Container();
        me.game.add(this.hud, 1000000);
	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		me.game.removeAll();
	}
});
