public abstract class MapItem {
	protected State state;
	
	enum State {
		CORRECT,
		WRONG,
		DEFAULT
	}

	public State getState() {
		return state;
	}
	
	public void setState(State correct) {
		this.state = correct;
	}
}
