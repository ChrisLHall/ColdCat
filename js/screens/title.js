game.TitleScreen = me.ScreenObject.extend({
	/**	
	 *  action to perform on state change
	 */
	onResetEvent: function() {
        me.input.bindKey(me.input.KEY.A, "left", false);
        me.input.bindKey(me.input.KEY.D, "right", false);
        me.input.bindKey(me.input.KEY.W, "up", false);
        me.input.bindKey(me.input.KEY.S, "down", false);
        me.input.bindKey(me.input.KEY.ENTER, "action", false);
        me.input.bindKey(me.input.KEY.SHIFT, "action", false);
        me.input.bindKey(me.input.KEY.SPACE, "action", false);

        me.state.change(me.state.PLAY);
	},
	
	
	/**	
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		me.game.removeAll();
	}
});
